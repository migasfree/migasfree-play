<template>
  <q-list v-if="Object.keys(items).length > 0" class="q-ma-md">
    <ExecutionDetail
      v-for="(item, name, index) in items"
      :id="name"
      :key="index"
      :command="item.command"
      :text="item.text"
      :icon="item.icon || ''"
    />
  </q-list>
  <q-banner v-else class="bg-info text-black q-ma-md">
    <template #avatar>
      <q-icon name="mdi-information-outline" color="white" />
    </template>
    {{ $gettext('There are not items to show.') }}
  </q-banner>
</template>

<script>
import { storeToRefs } from 'pinia'

import ExecutionDetail from 'components/ExecutionDetail.vue'

import { useExecutionsStore } from 'src/stores/executions'

export default {
  name: 'Executions',
  components: {
    ExecutionDetail,
  },
  setup() {
    const executionsStore = useExecutionsStore()
    const { items } = storeToRefs(executionsStore)

    return { items }
  },
}
</script>
