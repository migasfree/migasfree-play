<template>
  <div>
    <q-layout view="lHh Lpr lFf">
      <q-header class="glass-header print-hide">
        <q-toolbar>
          <q-btn
            ref="sync"
            unelevated
            round
            icon="mdi-play"
            size="18px"
            class="q-mr-md sync-btn-primary"
            color="primary"
            :loading="isRunningCommand"
            :disabled="isRunningCommand"
            @click="synchronize"
          >
            <q-tooltip>{{ $gettext('Synchronize Computer') }}</q-tooltip>
            <template #loading>
              <q-spinner color="white" />
            </template>
          </q-btn>
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
          <q-toolbar-title v-else
            >{{ computerText
            }}<q-tooltip>{{ computerText }}</q-tooltip></q-toolbar-title
          >

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

        <q-page-scroller
          position="bottom-right"
          reverse
          :offset="[18, 18]"
          :scroll-offset="0"
          class="print-hide"
        >
          <q-btn fab icon="mdi-chevron-down" color="primary" />
        </q-page-scroller>

        <q-page-scroller
          position="bottom-right"
          :offset="[18, 18]"
          :scroll-offset="300"
          class="print-hide"
        >
          <q-btn fab icon="mdi-chevron-up" color="primary" />
        </q-page-scroller>
      </q-page-container>
    </q-layout>

    <Register :value="showRegister" @closed="showRegister = !showRegister" />
  </div>
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

<style lang="scss">
@media print {
  .print-hide {
    display: none !important;
  }
}

.sync-btn-primary {
  background: rgba(var(--q-primary-rgb), 0.8) !important;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    background: var(--q-primary) !important;
    box-shadow: 0 4px 15px rgba(var(--q-primary-rgb), 0.4);
  }
}

.body--dark .sync-btn-primary {
  background: rgba(var(--q-accent-rgb), 0.2) !important;
  color: var(--q-accent) !important;
  border-color: rgba(var(--q-accent-rgb), 0.3);

  &:hover {
    background: rgba(var(--q-accent-rgb), 0.3) !important;
    box-shadow: 0 4px 15px rgba(var(--q-accent-rgb), 0.2);
  }
}
</style>
