<template>
  <q-page padding>
    <q-breadcrumbs class="print-hide">
      <q-breadcrumbs-el :label="$gettext('Info')" icon="info" />
    </q-breadcrumbs>

    <Info />
  </q-page>
</template>

<script>
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Info from 'components/Info.vue'

export default {
  components: {
    Info,
  },
  setup() {
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Info') })
  },
}
</script>
