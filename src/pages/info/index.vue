<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Info')" icon="info" />
    </q-breadcrumbs>

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
