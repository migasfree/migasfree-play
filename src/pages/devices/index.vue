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
import Devices from 'components/Devices.vue'

export default {
  meta() {
    return {
      title: this.$gettext('Devices')
    }
  },
  components: {
    Devices
  },
  methods: {
    async updateDevices() {
      this.$store.commit('ui/updating')
      await this.$store.dispatch('devices/computerDevices')
      await this.$store.dispatch('devices/getAvailableDevices')
      await this.$store.dispatch('devices/getFeaturesDevices')
      this.$store.commit('ui/updatingFinished')
    }
  }
}
</script>
