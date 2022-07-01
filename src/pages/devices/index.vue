<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Devices')" icon="mdi-printer" />
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="$store.state.ui.isUpdating"
        :disabled="$store.state.ui.isUpdating"
        @click="updateDevices"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </q-breadcrumbs>

    <div v-if="$store.state.ui.isUpdating" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <Devices v-else />
  </q-page>
</template>

<script>
import { useStore } from 'vuex'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Devices from 'components/Devices.vue'

export default {
  components: {
    Devices,
  },
  setup() {
    const store = useStore()
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Devices') })

    const updateDevices = async () => {
      store.commit('ui/updating')
      await store.dispatch('devices/computerDevices')
      await store.dispatch('devices/getAvailableDevices')
      await store.dispatch('devices/getFeaturesDevices')
      store.commit('ui/updatingFinished')
    }

    return { updateDevices }
  },
}
</script>
