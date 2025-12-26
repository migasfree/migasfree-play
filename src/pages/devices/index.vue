<template>
  <q-page padding>
    <PageLayout
      :title="$gettext('Devices')"
      icon="mdi-printer"
      :count="filteredDevices.length"
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
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import BannerInfo from 'components/BannerInfo'
import Devices from 'components/Devices'
import PageLayout from 'components/PageLayout'

import { useDevicesStore } from 'src/stores/devices'
import { useProgramStore } from 'src/stores/program'
import { usePageSync } from 'src/composables/usePageSync'

const { $gettext } = useGettext()

const devicesStore = useDevicesStore()
const programStore = useProgramStore()

const { filteredDevices } = storeToRefs(devicesStore)

const manageDevices = programStore.manageDevices

useMeta({ title: $gettext('Devices') })

const { isUpdating, sync } = usePageSync(async () => {
  await Promise.all([
    devicesStore.computerDevices(),
    devicesStore.getAvailableDevices(),
    devicesStore.getFeaturesDevices(),
  ])
})
</script>
