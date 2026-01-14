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
          @click="openRegister"
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

      <q-page-scroller
        position="bottom-right"
        reverse
        :offset="[18, 100]"
        :scroll-offset="0"
      >
        <q-btn fab icon="mdi-chevron-down" color="primary" />
      </q-page-scroller>

      <q-page-scroller
        position="bottom-right"
        :offset="[18, 100]"
        :scroll-offset="300"
      >
        <q-btn fab icon="mdi-chevron-up" color="primary" />
      </q-page-scroller>
    </q-page-container>
  </q-layout>

  <Register :value="showRegister" @closed="showRegister = !showRegister" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { appName } from 'config/app.conf'
import Menu from 'components/Menu'
import Register from 'components/Register'

import { useComputerStore } from 'src/stores/computer'
import { useExecutionsStore } from 'src/stores/executions'
import { usePreferencesStore } from 'src/stores/preferences'
import { useProgramStore } from 'src/stores/program'
import { useUiStore } from 'src/stores/ui'

const showRegister = ref(false)

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

useMeta({ titleTemplate: (title) => `${title} | ${appName}` })

const openRegister = () => {
  showRegister.value = true
}

const computerText = computed(() => {
  return cid.value ? `${name.value} (CID-${cid.value})` : name.value
})

const synchronize = () => {
  uiStore.notifyInfo($gettext('Synchronizing...'))

  if (showSyncDetails.value && route.name !== 'details')
    router.push({ name: 'details' })

  const cmd = {
    command: 'migasfree',
    args: clientVersion.value.startsWith('4.') ? ['--update'] : ['sync'],
  }

  executionsStore.run({
    cmd,
    text: $gettext('Synchronization'),
    icon: 'mdi-sync',
  })
}

if (!showApps.value) router.push({ name: 'details' })

onMounted(async () => {
  const syncAfterStart = await window.electronAPI.getSyncAfterStart()

  if (syncAfterStart) {
    synchronize()
  }

  setInterval(synchronize, 24 * 60 * 60 * 1000)
})
</script>
