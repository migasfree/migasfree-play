<template>
  <q-page padding>
    <PageLayout
      :title="$gettext('Devices')"
      :icon="appIcon('devices')"
      :count="filteredDevices.length"
      :total-count="devices.length"
      :show-count="manageDevices"
      :show-sync="manageDevices"
      :loading="isUpdating"
      @sync="sync"
    >
      <template #content>
        <template v-if="manageDevices">
          <Devices />
        </template>
        <BannerInfo
          v-else
          :message="$gettext('Client does not manage devices')"
        />
      </template>
    </PageLayout>
  </q-page>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import BannerInfo from 'components/BannerInfo.vue'
import Devices from 'components/Devices.vue'
import PageLayout from 'components/PageLayout.vue'

import { useDevicesStore } from 'src/stores/devices'
import { useServerStore } from 'src/stores/server'
import { usePageSync } from 'src/composables/usePageSync'
import { appIcon } from 'src/composables/element'

const { $gettext } = useGettext()

const devicesStore = useDevicesStore()
const serverStore = useServerStore()

const { devices, filteredDevices } = storeToRefs(devicesStore)

const manageDevices = serverStore.manageDevices

useMeta({ title: $gettext('Devices') })

const { isUpdating, sync } = usePageSync(async () => {
  await devicesStore.computerDevices()
  await devicesStore.getAvailableDevices()
  await devicesStore.getFeaturesDevices()
})

onMounted(() => {
  if (manageDevices && !devicesStore.hasLoaded) {
    sync()
  }
})
</script>
