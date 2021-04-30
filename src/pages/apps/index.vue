<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Apps')" icon="apps" />
    </q-breadcrumbs>

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
