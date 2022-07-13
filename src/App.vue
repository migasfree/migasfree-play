<template>
  <div id="q-app">
    <div
      v-if="$store.state.ui.isLoading"
      class="row window-height window-width justify-center items-center content-center"
    >
      <div class="col-12 text-center q-ma-md">
        <img id="logo" src="img/migasfree-play.svg" width="200" />
      </div>

      <div v-if="!$store.getters['app/stoppedApp']" class="col-12 text-center">
        <q-spinner-clock color="primary" size="6em" />
      </div>

      <div class="col-12 text-center q-mt-md">
        {{ $gettext('Loading data') }}: {{ $store.getters['app/status'] }}
      </div>

      <q-banner
        v-if="$store.getters['app/stoppedApp']"
        class="text-white bg-red q-ma-md"
      >
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
import { useStore } from 'vuex'
import { useMeta, useQuasar } from 'quasar'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const $q = useQuasar()

    $q.dark.set($q.localStorage.getItem('darkMode') || false)

    useMeta({ title: 'Migasfree Play' })

    store.dispatch('app/init')
  },
}
</script>
