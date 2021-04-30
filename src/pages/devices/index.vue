<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Devices')" icon="mdi-printer" />
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
  }
}
</script>
