<template>
  <div id="q-app">
    <Transition name="fade" mode="out-in">
      <div
        v-if="isLoading"
        key="loading"
        class="row justify-center items-center content-center window-height"
      >
        <div class="col-12 text-center q-mb-xl">
          <img
            id="logo"
            class="pulse"
            src="img/migasfree-play.svg"
            width="200"
          />
          <p class="text-h6 text-grey-8">migasfree &#x1f49a; change</p>
        </div>

        <template v-if="appIsStopped">
          <div class="col-10 col-md-6">
            <q-banner class="text-white bg-red rounded-borders shadow-2">
              <template #avatar>
                <q-icon name="mdi-alert-octagon" />
              </template>
              <div class="text-h6">
                {{ status }}.<br />{{ $gettext('Impossible to continue.') }}
              </div>
              <div class="text-subtitle2 q-mt-sm">
                {{
                  $ngettext(
                    'Automatic retry in %{ count } second...',
                    'Automatic retry in %{ count } seconds...',
                    retryCountdown,
                    { count: retryCountdown },
                  )
                }}
              </div>
            </q-banner>

            <div class="text-center q-mt-lg">
              <q-btn
                icon="mdi-reload"
                :label="$gettext('Retry now')"
                color="primary"
                rounded
                unelevated
                @click="retry"
              />
            </div>
          </div>
        </template>

        <div v-else class="col-10 col-sm-6 col-md-4">
          <q-card flat bordered class="bg-grey-1">
            <q-list padding>
              <q-item>
                <q-item-section avatar>
                  <q-spinner-dots color="primary" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-subtitle1 text-weight-bold">{{
                    $gettext('Loading data')
                  }}</q-item-label>
                  <q-item-label caption>{{
                    $gettext('Please wait...')
                  }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator spaced />

              <TransitionGroup name="list">
                <q-item v-for="item in loadingData" :key="item.label" dense>
                  <q-item-section avatar>
                    <q-icon
                      v-if="loadedData.includes(item.value)"
                      color="positive"
                      name="mdi-check-circle"
                      size="sm"
                    />
                    <q-spinner v-else color="primary" size="xs" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ item.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </TransitionGroup>
            </q-list>
          </q-card>
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
