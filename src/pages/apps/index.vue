<template>
  <q-page padding>
    <Apps />
  </q-page>
</template>

<script>
import Apps from 'components/Apps.vue'

export default {
  meta() {
    return {
      title: this.$gettext('Apps')
    }
  },
  components: {
    Apps
  }
}
</script>
