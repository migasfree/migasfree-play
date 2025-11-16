<template>
  <q-page id="main" padding>
    <PageHeader
      :title="$gettext('Details')"
      icon="mdi-list-status"
      :count="count"
    />

    <Executions />
  </q-page>
</template>

<script>
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { storeToRefs } from 'pinia'

import Executions from 'components/Executions'
import PageHeader from 'components/PageHeader'

import { useExecutionsStore } from 'src/stores/executions'

export default {
  components: {
    Executions,
    PageHeader,
  },
  setup() {
    const { $gettext } = useGettext()
    const executionsStore = useExecutionsStore()
    const { items } = storeToRefs(executionsStore)

    useMeta({ title: $gettext('Details') })

    return { count: Object.keys(items.value).length }
  },
}
</script>
