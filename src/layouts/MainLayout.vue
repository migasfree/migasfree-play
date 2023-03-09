<template>
  <q-layout view="lHh Lpr lFf">
    <q-header unelevated class="print-hide">
      <q-toolbar>
        <q-btn
          v-if="showComputerLink"
          stretch
          flat
          :label="computerText"
          :href="link"
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
            v-if="showApps"
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
            v-if="showDevices"
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
            v-if="showTags"
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
            v-if="showDetails"
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
            v-if="showInfo"
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
            v-if="showHelp"
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

    <q-page-container id="main">
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
          :color="$q.dark.isActive ? 'indigo' : 'secondary'"
          :loading="isRunningCommand"
          :disabled="isRunningCommand"
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
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { setInterval } from 'timers'

import { urlHelp } from 'config/app.conf'
import Menu from 'components/Menu.vue'

import { useAppStore } from 'src/stores/app'
import { useComputerStore } from 'src/stores/computer'
import { useExecutionsStore } from 'src/stores/executions'
import { usePreferencesStore } from 'src/stores/preferences'
import { useUiStore } from 'src/stores/ui'

export default {
  name: 'MainLayout',
  components: {
    Menu,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { $gettext } = useGettext()

    const appStore = useAppStore()
    const computerStore = useComputerStore()
    const executionsStore = useExecutionsStore()
    const preferencesStore = usePreferencesStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(appStore)
    const { cid, name, link } = storeToRefs(computerStore)
    const { isRunningCommand } = storeToRefs(executionsStore)
    const {
      showSyncDetails,
      showComputerLink,
      showApps,
      showDevices,
      showTags,
      showDetails,
      showInfo,
      showHelp,
    } = storeToRefs(preferencesStore)

    useMeta({ titleTemplate: (title) => `${title} | Migasfree Play` })

    const computerText = computed(() => {
      return cid.value ? `${name.value} (CID-${cid.value})` : name
    })

    const synchronize = () => {
      uiStore.notifyInfo($gettext('Synchronizing...'))

      if (showSyncDetails && route.name !== 'details')
        router.push({ name: 'details' })

      let cmd = 'migasfree sync'
      if (clientVersion.value.startsWith('4.')) cmd = 'migasfree --update'

      executionsStore.run({
        cmd,
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

    return {
      computerText,
      link,
      synchronize,
      urlHelp,
      isRunningCommand,
      showComputerLink,
      showApps,
      showDevices,
      showTags,
      showDetails,
      showInfo,
      showHelp,
    }
  },
}
</script>
