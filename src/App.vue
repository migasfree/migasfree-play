<template>
  <div id="q-app">
    <div
      v-if="isLoading"
      class="row window-height window-width justify-center items-center content-center"
    >
      <div class="col-12 text-center q-ma-md">
        <img id="logo" src="img/migasfree-play.svg" width="200" />
      </div>

      <template v-if="appIsStopped">
        <q-banner class="text-white bg-red q-ma-md">
          <template #avatar>
            <q-icon name="mdi-alert-octagon" />
          </template>
          <div class="text-h6">
            {{ status }}.<br />{{ $gettext('Impossible to continue.') }}
          </div>
        </q-banner>

        <div class="col-12 text-center q-mt-md">
          <q-btn
            icon="mdi-reload"
            :label="$gettext('Retry')"
            color="primary"
            @click="retry"
          />
        </div>
      </template>

      <template v-else>
        <div class="col-12 text-center">
          <q-spinner-clock color="primary" size="6em" />
        </div>

        <div class="col-12 text-center text-h6 q-mt-md">
          {{ $gettext('Loading data') }}:
        </div>

        <div class="col-6 offset-4 q-mt-md">
          <q-option-group
            v-model="loadedData"
            :options="loadingData"
            type="checkbox"
            dense
            disable
          />
        </div>
      </template>
    </div>

    <router-view v-else />
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMeta, useQuasar } from 'quasar'

import { appName } from 'config/app.conf'

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

    const { appIsStopped, status } = storeToRefs(programStore)
    const { isLoading } = storeToRefs(uiStore)

    $q.dark.set($q.localStorage.getItem('darkMode') || false)

    useMeta({ title: appName })

    programStore.init()

    const retry = () => {
      loadedData.value.length = 0
      loadingData.value.length = 0
      programStore.init()
    }

    watch(status, (value, old) => {
      if (old) loadedData.value.push(old)
      loadingData.value.push({ label: value, value: value })
    })

    return {
      appIsStopped,
      status,
      loadedData,
      loadingData,
      isLoading,
      retry,
    }
  },
}
</script>
