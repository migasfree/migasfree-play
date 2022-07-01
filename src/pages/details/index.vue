<template>
  <q-page id="main" padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Details')" icon="mdi-list-status" />
    </q-breadcrumbs>

    <Executions />
  </q-page>
</template>

<script>
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Executions from 'components/Executions.vue'

export default {
  components: {
    Executions,
  },
  setup() {
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Details') })
  },
}
</script>
