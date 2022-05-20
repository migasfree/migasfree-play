<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="print-hide">
      <q-toolbar>
        <q-btn
          v-if="$store.state.preferences.showComputerLink"
          stretch
          flat
          :label="computerText"
          :href="$store.getters['computer/getComputer'].link"
          type="a"
          target="_blank"
          no-caps
          size="21px"
        >
          <q-tooltip>{{ $gettext('View Computer') }}</q-tooltip>
        </q-btn>
        <q-toolbar-title v-else>{{ computerText }}</q-toolbar-title>

        <q-space />

        <div class="gt-xs">
          <q-btn
            v-if="$store.state.preferences.showApps"
            flat
            round
            icon="apps"
            size="lg"
            class="q-mx-xs"
            :disabled="$route.name === 'apps'"
            @click="$router.push({ name: 'apps' })"
          >
            <q-tooltip>{{ $gettext('Apps') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="$store.state.preferences.showDevices"
            flat
            round
            icon="mdi-printer"
            size="lg"
            class="q-mx-xs"
            :disabled="$route.name === 'devices'"
            @click="$router.push({ name: 'devices' })"
          >
            <q-tooltip>{{ $gettext('Devices') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="$store.state.preferences.showTags"
            flat
            round
            icon="mdi-tag"
            size="lg"
            class="q-mx-xs"
            :disabled="$route.name === 'tags'"
            @click="$router.push({ name: 'tags' })"
          >
            <q-tooltip>{{ $gettext('Tags') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="$store.state.preferences.showDetails"
            flat
            round
            icon="mdi-list-status"
            size="lg"
            class="q-mx-xs"
            :disabled="$route.name === 'details'"
            @click="$router.push({ name: 'details' })"
          >
            <q-tooltip>{{ $gettext('Details') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="$store.state.preferences.showInfo"
            flat
            round
            icon="info"
            size="lg"
            class="q-mx-xs"
            :disabled="$route.name === 'info'"
            @click="$router.push({ name: 'info' })"
          >
            <q-tooltip>{{ $gettext('Info') }}</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="mdi-cog"
            size="lg"
            class="q-mx-xs"
            :disabled="$route.name === 'preferences'"
            @click="$router.push({ name: 'preferences' })"
          >
            <q-tooltip>{{ $gettext('Preferences') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="$store.state.preferences.showHelp"
            flat
            round
            icon="help"
            size="lg"
            class="q-mx-xs"
            type="a"
            target="_blank"
            :href="urlHelp"
          >
            <q-tooltip>{{ $gettext('Help') }}</q-tooltip>
          </q-btn>
        </div>

        <div class="lt-sm">
          <Menu />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />

      <q-page-sticky
        class="print-hide"
        position="bottom-right"
        :offset="[18, 18]"
      >
        <q-btn
          ref="sync"
          fab
          icon="mdi-play"
          color="secondary"
          :loading="$store.state.executions.isRunningCommand"
          :disabled="$store.state.executions.isRunningCommand"
          @click="synchronize"
        >
          <q-tooltip>{{ $gettext('Synchronize Computer') }}</q-tooltip>
        </q-btn>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { setInterval } from 'timers'

import { urlHelp } from 'config/app.conf'
import Menu from 'components/Menu.vue'

export default {
  name: 'MainLayout',
  meta: {
    titleTemplate: (title) => `${title} | Migasfree Play`,
  },
  components: {
    Menu,
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const { $gettext } = useGettext()

    const computerText = computed(() => {
      const computer = store.getters['computer/getComputer']

      return computer.cid
        ? `${computer.name} (CID-${computer.cid})`
        : computer.name
    })

    const synchronize = () => {
      store.dispatch('ui/notifyInfo', $gettext('Synchronizing...'))

      if (store.state.preferences.showSyncDetails && route.name !== 'details')
        router.push({ name: 'details' })

      store.dispatch('executions/run', {
        cmd: 'migasfree sync',
        text: $gettext('Synchronization'),
        icon: 'mdi-sync',
      })
    }

    onMounted(() => {
      const app = window.electronRemote.app

      if (app.syncAfterStart) {
        synchronize()
        setInterval(synchronize, 24 * 60 * 60 * 1000)
      }
    })

    return { computerText, synchronize, urlHelp }
  },
}
</script>
