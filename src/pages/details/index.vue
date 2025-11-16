<template>
  <q-page id="main" padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Details')" icon="mdi-list-status" />

      <div v-if="count > 0" class="row items-center q-ml-xs">
        <q-chip
          outline
          color="primary"
          text-color="white"
          class="text-right"
          size="sm"
        >
          {{ count }}
        </q-chip>
      </div>
    </q-breadcrumbs>

    <Executions />
  </q-page>
</template>

<script>
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { storeToRefs } from 'pinia'

import Executions from 'components/Executions'

import { useExecutionsStore } from 'src/stores/executions'

export default {
  components: {
    Executions,
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
