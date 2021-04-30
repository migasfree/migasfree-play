<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Preferences')" icon="mdi-cog" />
    </q-breadcrumbs>

    <Preferences />
  </q-page>
</template>

<script>
import Preferences from 'components/Preferences.vue'

export default {
  meta() {
    return {
      title: this.$gettext('Preferences')
    }
  },
  components: {
    Preferences
  }
}
</script>
