<template>
  <q-list v-if="Object.keys(items).length > 0" class="q-ma-md">
    <ExecutionDetail
      v-for="(item, name, index) in items"
      :id="name"
      :key="index"
      :command="item.command"
      :text="item.text"
      :error="item.error || ''"
      :icon="item.icon || ''"
    />
  </q-list>

  <BannerInfo v-else :message="$gettext('There are not items to show.')" />
</template>

<script>
import { storeToRefs } from 'pinia'

import BannerInfo from 'components/BannerInfo'
import ExecutionDetail from 'components/ExecutionDetail'

import { useExecutionsStore } from 'src/stores/executions'

export default {
  name: 'Executions',
  components: {
    BannerInfo,
    ExecutionDetail,
  },
  setup() {
    const executionsStore = useExecutionsStore()
    const { items } = storeToRefs(executionsStore)

    return { items }
  },
}
</script>
