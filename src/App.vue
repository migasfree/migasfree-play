<template>
  <div id="q-app">
    <Transition name="fade">
      <div
        v-if="isLoading"
        key="loading"
        class="splash-overlay flex flex-center"
        :style="{ pointerEvents: isLoading ? 'auto' : 'none' }"
      >
        <div class="splash-content text-center">
          <!-- Logo & Brand Section -->
          <div class="brand-section q-mb-xl">
            <img
              id="logo"
              class="pulse-gentle q-mb-md"
              src="img/migasfree-play.svg"
              width="160"
              :alt="$gettext('migasfree logo')"
            />
            <div class="row items-center justify-center brand-text-group">
              <span class="text-h4 text-weight-bold brand-name q-mr-sm"
                >migasfree</span
              >
              <div class="brand-slogan text-subtitle1 text-grey-7">
                <q-icon
                  :name="appIcon('heart')"
                  color="negative"
                  size="xs"
                  aria-label="loves"
                />
                change
              </div>
            </div>
          </div>

          <!-- Interaction Zone: Progress or Error -->
          <Transition name="fade" mode="out-in">
            <!-- Error State -->
            <div v-if="appIsStopped" key="error">
              <q-card flat class="glass-card error-card">
                <q-card-section class="q-pa-xl">
                  <q-icon
                    :name="appIcon('warning')"
                    color="negative"
                    size="64px"
                    class="q-mb-lg"
                  />
                  <div class="text-h5 text-weight-bolder q-mb-sm">
                    {{ status }}
                  </div>
                  <p class="text-body1 text-grey-7 q-mb-lg">
                    {{ $gettext('Impossible to synchronize with the server.') }}
                  </p>

                  <div
                    class="retry-indicator q-pa-md rounded-borders bg-surface-variant"
                  >
                    <div
                      class="text-caption text-weight-bold uppercase letter-spacing-1 text-grey-6 q-mb-xs"
                    >
                      {{ $gettext('Network Failure') }}
                    </div>
                    <div class="text-body2 text-weight-medium">
                      {{
                        $ngettext(
                          'Automatic retry in %{ count } second...',
                          'Automatic retry in %{ count } seconds...',
                          retryCountdown,
                          { count: retryCountdown },
                        )
                      }}
                    </div>
                  </div>
                </q-card-section>

                <q-separator vertical class="opacity-10" />

                <q-card-actions align="center" class="q-pa-lg">
                  <q-btn
                    unelevated
                    rounded
                    color="primary"
                    padding="12px 32px"
                    :label="$gettext('Retry now')"
                    :icon="appIcon('retry')"
                    class="text-weight-bold"
                    @click="retry"
                  />
                </q-card-actions>
              </q-card>
            </div>

            <!-- Loading Progress -->
            <div v-else key="progress" class="loading-progress">
              <div class="loading-container glass-card q-pa-lg">
                <div class="loading-list">
                  <TransitionGroup name="list">
                    <div
                      v-for="(item, index) in loadingData"
                      :key="item.label"
                      class="loading-item row items-center q-py-sm"
                      :class="[
                        {
                          'is-past': index < loadingData.length - 1,
                          'is-current': index === loadingData.length - 1,
                        },
                      ]"
                    >
                      <div
                        class="col-auto q-mr-md flex flex-center status-indicator"
                      >
                        <q-icon
                          v-if="index < loadingData.length - 1"
                          color="positive"
                          :name="appIcon('success')"
                          size="14px"
                          class="animated zoomIn"
                        />
                        <q-spinner-dots v-else color="primary" size="20px" />
                      </div>
                      <div class="col text-left text-body2 loading-text">
                        {{ item.label }}
                      </div>
                    </div>
                  </TransitionGroup>
                </div>
              </div>

              <!-- Footer info -->
              <div class="q-mt-xl text-caption text-grey-6 opacity-60">
                {{ app.name }} {{ app.version }} • {{ app.copyright }}
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <div v-if="!isLoading" id="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMeta, useQuasar } from 'quasar'

import { appName, retryIntervalSeconds } from 'config/app.conf'

import { useProgramStore } from './stores/program'
import { useUiStore } from './stores/ui'
import { appIcon } from './composables/element'

import app from '../package.json'

const programStore = useProgramStore()
const uiStore = useUiStore()
const $q = useQuasar()

const loadedData = ref([])
const loadingData = ref([])
const retryCountdown = ref(retryIntervalSeconds)

let retryIntervalId = null
let countdownIntervalId = null

const { appIsStopped, status } = storeToRefs(programStore)
const { isLoading } = storeToRefs(uiStore)

$q.dark.set($q.localStorage.getItem('darkMode') || false)

useMeta({ title: appName })

const clearRetryTimers = () => {
  if (retryIntervalId) {
    clearInterval(retryIntervalId)
    retryIntervalId = null
  }
  if (countdownIntervalId) {
    clearInterval(countdownIntervalId)
    countdownIntervalId = null
  }
}

const startRetryTimers = () => {
  clearRetryTimers()
  retryCountdown.value = retryIntervalSeconds

  countdownIntervalId = setInterval(() => {
    if (retryCountdown.value > 0) {
      retryCountdown.value--
    }
  }, 1000)

  retryIntervalId = setInterval(() => {
    retryCountdown.value = retryIntervalSeconds
    retry()
  }, retryIntervalSeconds * 1000)
}

const retry = async () => {
  clearRetryTimers()
  loadedData.value.length = 0
  loadingData.value.length = 0
  await programStore.init()
  if (appIsStopped.value) {
    startRetryTimers()
  }
}

watch(status, (value, old) => {
  if (old) loadedData.value.push(old)
  loadingData.value.push({ label: value, value: value })
})

watch(appIsStopped, (stopped) => {
  if (stopped) {
    startRetryTimers()
  } else {
    clearRetryTimers()
  }
})

onMounted(async () => {
  await programStore.init()
})

onUnmounted(() => {
  clearRetryTimers()
})
</script>

<style lang="scss">
.splash-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5000;
  background: var(--bg-body);
  transition: background 0.5s ease;
}

.splash-content {
  width: 440px;
  max-width: 92vw;
  padding: 0 var(--spacing-md, 16px);
}

/* Brand Section */
.brand-name {
  font-family: var(--font-ui);
  color: var(--brand-primary);
  letter-spacing: -1px;
  line-height: 1;
}

.brand-slogan {
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 700;
  opacity: 0.8;
}

.loading-container {
  width: 100%;
}

/* Loading Items */
.loading-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-past {
    opacity: 0.4;
    filter: grayscale(1);
    transform: scale(0.98);
  }

  &.is-current {
    transform: scale(1.02);
    .loading-text {
      font-weight: 700;
      color: var(--brand-primary);
    }
  }
}

.status-indicator {
  width: 28px;
  height: 28px;
}

/* Animations */
.pulse-gentle {
  animation: pulse-gentle-animation 4s ease-in-out infinite;
}

@keyframes pulse-gentle-animation {
  0%,
  100% {
    transform: scale(0.98);
    opacity: 0.9;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

.uppercase {
  text-transform: uppercase;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.bg-surface-variant {
  background: var(--bg-surface-variant);
}
</style>
