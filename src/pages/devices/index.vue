<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Devices')" icon="mdi-printer" />
      <q-chip
        v-if="manageDevices && filteredDevices.length > 0"
        outline
        color="primary"
        text-color="white"
        class="text-right"
        size="sm"
      >
        {{ filteredDevices.length }}
      </q-chip>
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
    </q-breadcrumbs>

    <template v-if="manageDevices">
      <div v-if="isUpdating" class="row q-ma-xl">
        <div class="col-12 text-center">
          <q-spinner color="primary" size="6em" />
        </div>
      </div>

      <Devices v-else />
    </template>

    <q-banner v-else class="bg-info text-black q-ma-md">
      <template #avatar>
        <q-icon name="mdi-information-outline" color="white" />
      </template>
      {{ $gettext('Client does not manage devices') }}
    </q-banner>
  </q-page>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Devices from 'components/Devices.vue'

import { useDevicesStore } from 'src/stores/devices'
import { useProgramStore } from 'src/stores/program'
import { useUiStore } from 'src/stores/ui'

export default {
  components: {
    Devices,
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
      await devicesStore.computerDevices()
      await devicesStore.getAvailableDevices()
      await devicesStore.getFeaturesDevices()
      uiStore.updatingFinished()
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
