<template>
  <q-scroll-observer @scroll="onScroll" />

  <q-expansion-item popup :default-opened="id === lastId" @show="onExpand">
    <template #header>
      <q-item-section v-if="icon" avatar>
        <q-avatar>
          <q-icon :name="icon" size="lg" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <div class="row items-center">
          {{ command }}
          <q-spinner-dots
            v-if="isCurrentlyRunning"
            color="primary"
            size="20px"
            class="q-ml-sm"
          />
        </div>
        <div class="text-caption text-muted"><DateView :value="id" /></div>
      </q-item-section>

      <q-item-section side>
        <div class="row items-center">
          <q-btn
            v-if="isCurrentlyRunning"
            flat
            icon="mdi-stop"
            color="negative"
            @click.stop="cancelCommand"
          >
            <q-tooltip>{{ $gettext('Cancel') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="error"
            flat
            icon="mdi-bug"
            color="negative"
            @click.stop="showError = true"
          />

          <CopyButton :text="textToCopy" />
        </div>
      </q-item-section>
    </template>

    <q-separator />

    <q-card>
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

  <q-dialog v-model="showError" full-width>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-card-section>
        <pre class="text-mono error-pre">{{ errorPlainText }}</pre>
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
    terminal.write(props.text)
    writtenLength = props.text.length

    // Scroll to top for completed executions, keep bottom for live ones
    if (!isCurrentlyRunning.value) {
      terminal.scrollToTop()
    }
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

const isDefaultOpened = computed(() => props.id === lastId.value)

const onExpand = () => {
  if (!isLegacyHtml.value) {
    nextTick(() => {
      createTerminal()
    })
  }
}

// Create terminal on mount if this is the default-opened item
onMounted(() => {
  if (isDefaultOpened.value && !isLegacyHtml.value) {
    // Allow the animation to complete and the container to get dimensions
    setTimeout(() => {
      createTerminal()
    }, 100)
  }
})

// Watch for new text chunks (during live command execution)
watch(
  () => props.text,
  (newText) => {
    if (isLegacyHtml.value) return

    if (terminal && newText.length > writtenLength) {
      const chunk = newText.slice(writtenLength)
      terminal.write(chunk)
      writtenLength = newText.length
    }

    // Auto-scroll logic
    const elem = document.getElementById('main')
    if (
      !('position' in scrollInfo.value) ||
      (scrollInfo.value.direction === 'down' &&
        scrollInfo.value.position.top - elem.scrollHeight < 150)
    ) {
      window.scrollTo(0, elem.scrollHeight)
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

<style scoped>
.terminal-wrapper {
  padding: 0 !important;
}

.terminal-container,
.legacy-container {
  min-height: 200px;
  background: #1e1e2e;
  border-radius: 0 0 8px 8px;
}

.terminal-container {
  padding: 8px;
}

.legacy-container {
  max-height: 400px;
  overflow-y: auto;
  color: #cdd6f4;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.4;
}

.terminal-container :deep(.xterm) {
  padding: 4px;
}

.error-pre {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-size: 13px;
}
</style>
