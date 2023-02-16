<template>
  <div id="q-app">
    <div
      v-if="isLoading"
      class="row window-height window-width justify-center items-center content-center"
    >
      <div class="col-12 text-center q-ma-md">
        <img id="logo" src="img/migasfree-play.svg" width="200" />
      </div>

      <div v-if="!appIsStopped" class="col-12 text-center">
        <q-spinner-clock color="primary" size="6em" />
      </div>

      <div class="col-12 text-center q-mt-md">
        {{ $gettext('Loading data') }}: {{ status }}
      </div>

      <q-banner v-if="appIsStopped" class="text-white bg-red q-ma-md">
        <template #avatar>
          <q-icon name="mdi-alert-octagon" />
        </template>
        <div class="text-h6">{{ $gettext('Impossible to continue.') }}</div>
      </q-banner>
    </div>

    <router-view v-else />
  </div>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useMeta, useQuasar } from 'quasar'

import { useAppStore } from './stores/app'
import { useUiStore } from './stores/ui'

export default {
  name: 'App',
  setup() {
    const appStore = useAppStore()
    const uiStore = useUiStore()
    const $q = useQuasar()

    const { appIsStopped, status } = storeToRefs(appStore)
    const { isLoading } = storeToRefs(uiStore)

    $q.dark.set($q.localStorage.getItem('darkMode') || false)

    useMeta({ title: 'Migasfree Play' })

    appStore.init()

    return {
      appIsStopped,
      status,
      isLoading,
    }
  },
}
</script>
