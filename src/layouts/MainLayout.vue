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

        <q-btn
          v-if="!cid"
          color="warning"
          icon="mdi-server-plus"
          @click="register"
          ><q-tooltip>{{
            $gettext('Register Computer on the Server')
          }}</q-tooltip></q-btn
        >

        <q-space />

        <Menu />
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
import Menu from 'components/Menu'

import { useComputerStore } from 'src/stores/computer'
import { useExecutionsStore } from 'src/stores/executions'
import { usePreferencesStore } from 'src/stores/preferences'
import { useProgramStore } from 'src/stores/program'
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

    const computerStore = useComputerStore()
    const executionsStore = useExecutionsStore()
    const preferencesStore = usePreferencesStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { cid, name, link } = storeToRefs(computerStore)
    const { isRunningCommand } = storeToRefs(executionsStore)
    const { showApps, showSyncDetails, showComputerLink } =
      storeToRefs(preferencesStore)
    const { clientVersion } = storeToRefs(programStore)

    useMeta({ titleTemplate: (title) => `${title} | Migasfree Play` })

    const computerText = computed(() => {
      return cid.value ? `${name.value} (CID-${cid.value})` : name.value
    })

    const synchronize = () => {
      uiStore.notifyInfo($gettext('Synchronizing...'))

      if (showSyncDetails.value && route.name !== 'details')
        router.push({ name: 'details' })

      let cmd = 'migasfree sync'
      if (clientVersion.value.startsWith('4.')) cmd = 'migasfree --update'

      executionsStore.run({
        cmd,
        text: $gettext('Synchronization'),
        icon: 'mdi-sync',
      })
    }

    const register = async () => {
      await computerStore.registerComputer({ user: 'yo', password: 'yo' })
    }

    if (!showApps.value) router.push({ name: 'details' })

    onMounted(() => {
      const app = window.electronRemote.app

      if (app.syncAfterStart) {
        synchronize()
      }

      setInterval(synchronize, 24 * 60 * 60 * 1000)
    })

    return {
      cid,
      computerText,
      link,
      synchronize,
      register,
      urlHelp,
      isRunningCommand,
      showComputerLink,
    }
  },
}
</script>
