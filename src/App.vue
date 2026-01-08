<template>
  <div id="q-app">
    <div
      v-if="isLoading"
      class="row justify-center items-center content-center"
    >
      <div class="col-12 text-center q-mx-md q-my-xl q-py-xl">
        <img id="logo" src="img/migasfree-play.svg" width="200" />
        <p class="text-h6">migasfree &#x1f49a; change</p>
      </div>

      <template v-if="appIsStopped">
        <q-banner class="text-white bg-red q-ma-md">
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

        <div class="col-12 text-center q-mt-md">
          <q-btn
            icon="mdi-reload"
            :label="$gettext('Retry now')"
            color="primary"
            @click="retry"
          />
        </div>
      </template>

      <div v-else class="col-6 offset-3">
        <q-list padding dense>
          <q-item>
            <q-item-label header class="text-subtitle1">{{
              $gettext('Loading data')
            }}</q-item-label>

            <q-item-section avatar>
              <q-spinner-clock color="primary" size="md" />
            </q-item-section>
          </q-item>

          <q-item v-for="item in loadingData" :key="item.label">
            <q-item-section avatar>
              <q-icon
                v-if="loadedData.includes(item.value)"
                color="positive"
                name="mdi-check"
              />
              <q-spinner v-else color="primary" />
            </q-item-section>

            <q-item-section>
              {{ item.label }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <router-view v-else />
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMeta, useQuasar } from 'quasar'

import { appName, retryIntervalSeconds } from 'config/app.conf'

import { useProgramStore } from './stores/program'
import { useUiStore } from './stores/ui'

export default {
  name: 'App',
  setup() {
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

    return {
      appIsStopped,
      status,
      loadedData,
      loadingData,
      isLoading,
      retry,
      retryCountdown,
    }
  },
}
</script>
