<template>
  <q-page padding>
    <Info />
  </q-page>
</template>

<script>
import Info from 'components/Info.vue'

export default {
  meta() {
    return {
      title: this.$gettext('Info')
    }
  },
  components: {
    Info
  }
}
</script>
