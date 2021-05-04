<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Devices')" icon="mdi-printer" />
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="updating"
        :disabled="updating"
        @click="updateDevices"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </q-breadcrumbs>

    <Devices />
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
  data() {
    return {
      updating: false
    }
  },
  methods: {
    async updateDevices() {
      this.updating = true
      await this.$store.dispatch('devices/computerDevices')
      await this.$store.dispatch('devices/getAvailableDevices')
      await this.$store.dispatch('devices/getFeaturesDevices')
      this.updating = false
    }
  }
}
</script>
