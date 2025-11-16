<template>
  <q-page padding>
    <PageHeader
      :title="$gettext('Devices')"
      icon="mdi-printer"
      :count="filteredDevices.length"
      :show-count="manageDevices"
    >
      <q-btn
        v-if="manageDevices"
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="isUpdating"
        :disabled="isUpdating"
        @click="updateDevices"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </PageHeader>

    <template v-if="manageDevices">
      <div v-if="isUpdating" class="row q-ma-xl">
        <div class="col-12 text-center">
          <q-spinner color="primary" size="6em" />
        </div>
      </div>

      <Devices v-else />
    </template>

    <BannerInfo v-else :message="$gettext('Client does not manage devices')" />
  </q-page>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import BannerInfo from 'components/BannerInfo'
import Devices from 'components/Devices'
import PageHeader from 'components/PageHeader'

import { useDevicesStore } from 'src/stores/devices'
import { useProgramStore } from 'src/stores/program'
import { useUiStore } from 'src/stores/ui'

export default {
  components: {
    BannerInfo,
    Devices,
    PageHeader,
  },
  setup() {
    const { $gettext } = useGettext()

    const devicesStore = useDevicesStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { filteredDevices } = storeToRefs(devicesStore)
    const { isUpdating } = storeToRefs(uiStore)

    useMeta({ title: $gettext('Devices') })

    const updateDevices = async () => {
      uiStore.updating()
      try {
        await Promise.all([
          devicesStore.computerDevices(),
          devicesStore.getAvailableDevices(),
          devicesStore.getFeaturesDevices(),
        ])
      } finally {
        uiStore.updatingFinished()
      }
    }

    return {
      filteredDevices,
      isUpdating,
      updateDevices,
      manageDevices: programStore.manageDevices,
    }
  },
}
</script>
