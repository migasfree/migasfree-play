<template>
  <div id="q-app">
    <Transition name="fade" mode="out-in">
      <div
        v-if="isLoading"
        key="loading"
        class="row justify-center items-center content-center window-height bg-grey-1"
      >
        <div class="col-10 col-sm-6 col-md-4 text-center">
          <div class="q-mb-xl">
            <img
              id="logo"
              class="pulse"
              src="img/migasfree-play.svg"
              width="180"
            />
            <div class="text-h6 text-grey-8 q-mt-sm">
              migasfree &#x1f49a; change
            </div>
          </div>

          <Transition name="fade" mode="out-in">
            <div v-if="appIsStopped" key="error">
              <q-card flat bordered class="bg-white shadow-1">
                <q-card-section class="text-center q-pa-lg">
                  <q-icon
                    name="mdi-alert-circle-outline"
                    color="negative"
                    size="4rem"
                    class="q-mb-md"
                  />
                  <div class="text-h6 q-mb-xs">{{ status }}</div>
                  <div class="text-body2 text-grey-7">
                    {{ $gettext('Impossible to continue.') }}
                  </div>
                  <div class="text-caption text-grey-6 q-mt-sm">
                    {{
                      $ngettext(
                        'Automatic retry in %{ count } second...',
                        'Automatic retry in %{ count } seconds...',
                        retryCountdown,
                        { count: retryCountdown },
                      )
                    }}
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="center" class="q-pa-md">
                  <q-btn
                    unelevated
                    rounded
                    color="primary"
                    :label="$gettext('Retry now')"
                    icon="mdi-reload"
                    class="q-px-lg"
                    @click="retry"
                  />
                </q-card-actions>
              </q-card>
            </div>

            <div v-else key="progress" class="text-left">
              <div
                class="loading-container q-pa-md bg-white rounded-borders shadow-1 border-grey-3"
              >
                <TransitionGroup name="list" tag="div" class="loading-list">
                  <div
                    v-for="(item, index) in loadingData"
                    :key="item.label"
                    class="loading-item row items-center q-py-xs"
                    :class="{
                      'opacity-50 text-grey-7': index < loadingData.length - 1,
                    }"
                  >
                    <div
                      class="col-auto q-mr-md"
                      style="width: 24px; text-align: center"
                    >
                      <q-icon
                        v-if="
                          loadedData.includes(item.value) &&
                          index < loadingData.length - 1
                        "
                        color="positive"
                        name="mdi-check-circle"
                        size="xs"
                      />
                      <q-spinner
                        v-else
                        color="primary"
                        size="xs"
                        class="block"
                      />
                    </div>
                    <div
                      class="col text-body2 transition-colors"
                      :class="{
                        'text-weight-bold text-primary':
                          index === loadingData.length - 1,
                      }"
                    >
                      {{ item.label }}
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div v-else key="main">
        <router-view />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMeta, useQuasar } from 'quasar'

import { appName, retryIntervalSeconds } from 'config/app.conf'

import { useProgramStore } from './stores/program'
import { useUiStore } from './stores/ui'

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
.opacity-50 {
  opacity: 0.5;
}

.transition-colors {
  transition:
    color 0.3s ease,
    font-weight 0.3s ease;
}

.loading-container {
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.loading-list {
  position: relative;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
