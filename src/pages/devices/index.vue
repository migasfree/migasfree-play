<template>
  <q-page padding>
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
  }
}
</script>
