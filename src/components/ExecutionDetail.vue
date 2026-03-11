<template>
  <q-scroll-observer @scroll="onScroll" />

  <q-expansion-item
    ref="expansionRef"
    v-model="isExpanded"
    class="glass-card execution-item q-mb-md overflow-hidden"
    @show="onExpand"
  >
    <template #header>
      <q-item-section v-if="icon" avatar class="self-center">
        <q-icon :name="icon" size="28px" color="primary" />
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <h4
            class="execution-title text-primary letter-spacing-1 col ellipsis q-ma-none"
          >
            {{ command }}
            <q-tooltip>{{ command }}</q-tooltip>
          </h4>
        </q-item-label>
        <q-item-label
          caption
          class="text-muted flex items-center q-gutter-x-xs q-mt-xs"
        >
          <q-icon name="mdi-clock-outline" size="14px" />
          <DateView :value="id" />
        </q-item-label>
      </q-item-section>

      <q-item-section side class="self-center">
        <div class="row items-center q-gutter-x-sm no-wrap">
          <q-spinner-dots
            v-if="isCurrentlyRunning"
            color="primary"
            size="24px"
            class="q-mr-sm"
            aria-live="polite"
          />

          <q-btn
            v-if="isCurrentlyRunning"
            flat
            round
            dense
            icon="mdi-stop"
            color="negative"
            class="action-btn"
            :aria-label="$gettext('Cancel execution')"
            @click.stop="cancelCommand"
          >
            <q-tooltip>{{ $gettext('Cancel execution') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="error"
            flat
            round
            dense
            icon="mdi-alert-circle"
            color="negative"
            class="action-btn"
            :aria-label="$gettext('Show error details')"
            @click.stop="showError = true"
          >
            <q-tooltip>{{ $gettext('Show error details') }}</q-tooltip>
          </q-btn>

          <CopyButton
            v-if="!isCurrentlyRunning"
            :text="textToCopy"
            flat
            round
            dense
            class="action-btn"
          />
        </div>
      </q-item-section>
    </template>

    <q-separator class="card-separator" />

    <q-card unelevated class="bg-transparent">
      <q-card-section class="terminal-wrapper">
        <!-- Legacy HTML fallback for old persisted executions -->
        <div
          v-if="isLegacyHtml"
          class="text-mono legacy-container q-pa-md"
          v-html="text"
        ></div>
        <!-- xterm.js terminal for raw ANSI output -->
        <div v-else ref="terminalRef" class="terminal-container"></div>
      </q-card-section>
    </q-card>
  </q-expansion-item>

  <q-dialog v-model="showError" backdrop-filter="blur(4px)">
    <q-card class="glass-card error-dialog" style="min-width: 80vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-overline text-negative">
          <q-icon name="mdi-bug" size="xs" class="q-mr-xs" />
          {{ $gettext('Execution Error') }}
        </div>
        <q-space />
        <div class="row items-center q-gutter-x-sm">
          <CopyButton
            :text="errorPlainText"
            flat
            round
            dense
            color="negative"
            class="action-btn"
          />
          <q-btn
            v-close-popup
            icon="mdi-close"
            flat
            round
            dense
            color="grey-7"
            class="action-btn"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div
          class="error-container q-pa-md rounded-borders bg-negative-transparent"
        >
          <pre class="text-mono error-pre">{{ errorPlainText }}</pre>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { watch, ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

import CopyButton from 'components/CopyButton'
import DateView from 'components/DateView'

import { useExecutionsStore } from 'src/stores/executions'

const props = defineProps({
  id: { type: String, required: true },
  command: { type: String, required: true },
  text: { type: String, required: false, default: '' },
  error: { type: String, required: false, default: '' },
  icon: { type: String, required: false, default: '' },
})

const { $gettext } = useGettext()

const executionsStore = useExecutionsStore()
const { lastId, isRunningCommand } = storeToRefs(executionsStore)

const scrollInfo = ref({})
const showError = ref(false)
const terminalRef = ref(null)
const expansionRef = ref(null)
const isExpanded = ref(props.id === lastId.value)

let terminal = null
let fitAddon = null
let resizeObserver = null
let writtenLength = 0

const isCurrentlyRunning = computed(
  () => props.id === lastId.value && isRunningCommand.value,
)

const isLegacyHtml = computed(
  () => props.text.includes('<br />') || props.text.includes('<span'),
)

const textToCopy = computed(() =>
  isLegacyHtml.value ? props.text : executionsStore.stripAnsi(props.text),
)

const errorPlainText = computed(() => executionsStore.stripAnsi(props.error))

const createTerminal = () => {
  if (terminal || !terminalRef.value) return

  terminal = new Terminal({
    convertEol: true,
    disableStdin: true,
    cursorBlink: false,
    cursorStyle: 'bar',
    cursorInactiveStyle: 'none',
    scrollback: 10000,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    lineHeight: 1.4,
    theme: {
      background: '#1e1e2e',
      foreground: '#cdd6f4',
      cursor: '#f5e0dc',
      selectionBackground: '#585b7066',
      black: '#45475a',
      red: '#f38ba8',
      green: '#a6e3a1',
      yellow: '#f9e2af',
      blue: '#89b4fa',
      magenta: '#cba6f7',
      cyan: '#94e2d5',
      white: '#bac2de',
      brightBlack: '#585b70',
      brightRed: '#f38ba8',
      brightGreen: '#a6e3a1',
      brightYellow: '#f9e2af',
      brightBlue: '#89b4fa',
      brightMagenta: '#cba6f7',
      brightCyan: '#94e2d5',
      brightWhite: '#a6adc8',
    },
  })

  fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  terminal.open(terminalRef.value)
  fitAddon.fit()

  // Auto-resize terminal when container changes size
  resizeObserver = new ResizeObserver(() => {
    if (fitAddon) fitAddon.fit()
  })
  resizeObserver.observe(terminalRef.value)

  // Write existing text (for restored executions)
  if (props.text) {
    terminal.write(props.text, () => {
      // Scroll to top for completed executions, keep bottom for live ones
      if (!isCurrentlyRunning.value) {
        terminal.scrollToTop()
      }
    })
    writtenLength = props.text.length
  }
}

const disposeTerminal = () => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (terminal) {
    terminal.dispose()
    terminal = null
    fitAddon = null
    writtenLength = 0
  }
}

const scrollToBottom = () => {
  if (isCurrentlyRunning.value && isExpanded.value) {
    nextTick(() => {
      // Small timeout to wait for expansion animation to start/finish
      setTimeout(() => {
        expansionRef.value?.$el.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }, 250)
    })
  }
}

const onExpand = () => {
  if (!isLegacyHtml.value) {
    nextTick(() => {
      createTerminal()
    })
  }
  scrollToBottom()
}

// Collapse non-current items when a new execution starts
watch(
  () => lastId.value,
  (newLastId) => {
    if (props.id !== newLastId) {
      isExpanded.value = false
    } else {
      isExpanded.value = true
      // Execution started, wait for expansion and scroll
      scrollToBottom()
    }
  },
)

// Create terminal on mount if this item is expanded
onMounted(() => {
  if (isExpanded.value && !isLegacyHtml.value) {
    // Allow the animation to complete and the container to get dimensions
    setTimeout(() => {
      createTerminal()
      scrollToBottom()
    }, 150)
  }
})

// Watch for new text chunks (during live command execution)
watch(
  () => props.text,
  (newText) => {
    if (isLegacyHtml.value || !newText) return

    // If terminal doesn't exist yet, try to create it now
    if (!terminal && terminalRef.value) {
      createTerminal()
      // createTerminal writes props.text and sets writtenLength,
      // so no further action is needed for this chunk
    } else if (terminal && newText.length > writtenLength) {
      const chunk = newText.slice(writtenLength)
      terminal.write(chunk)
      writtenLength = newText.length
    }

    // Auto-scroll: terminal internal scroll
    if (terminal && isCurrentlyRunning.value) {
      terminal.scrollToBottom()
    }
  },
)

onBeforeUnmount(() => {
  disposeTerminal()
})

const onScroll = (info) => {
  scrollInfo.value = info
}

const cancelCommand = () => {
  executionsStore.cancelCurrentCommand()
}
</script>

<style lang="scss" scoped>
.execution-item {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;

  &:hover {
    border-color: var(--brand-primary);
  }
}

.execution-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.terminal-wrapper {
  padding: 0 !important;
}

.terminal-container,
.legacy-container {
  height: 600px;
  background: #1e1e2e;
}

.terminal-container {
  padding: 12px;
}

.legacy-container {
  overflow-y: auto;
  color: #cdd6f4;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.5;
}

.terminal-container :deep(.xterm) {
  padding: 4px;
}

.error-dialog {
  overflow: hidden;
}

.error-container {
  background: rgba(var(--q-negative-rgb), 0.05);
  border: 1px solid rgba(var(--q-negative-rgb), 0.1);
  max-height: 60vh;
  overflow-y: auto;

  /* Custom scrollbar for error container */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--q-negative-rgb), 0.2);
    border-radius: 10px;
  }
}

.error-pre {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.action-btn {
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }
}

.letter-spacing-1 {
  letter-spacing: 0.05em;
}

.card-separator {
  opacity: 0.1;
}

/* Dark Mode */
.body--dark {
  .execution-item {
    border-color: rgba(255, 255, 255, 0.1);
    &:hover {
      border-color: var(--q-primary);
    }
  }

  .card-separator {
    opacity: 0.05;
  }
}
</style>
