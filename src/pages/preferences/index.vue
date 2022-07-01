<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Preferences')" icon="mdi-cog" />
    </q-breadcrumbs>

    <Preferences />
  </q-page>
</template>

<script>
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Preferences from 'components/Preferences.vue'

export default {
  components: {
    Preferences,
  },
  setup() {
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Preferences') })
  },
}
</script>
