<template>
  <q-page padding>
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
