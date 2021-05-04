<template>
  <q-list v-if="$store.state.executions.log.length > 0" class="q-ma-md">
    <ExecutionDetail
      v-for="(item, name, index) in $store.state.executions.log"
      :id="name"
      :key="index"
      :command="item.command"
      :text="item.text"
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
import ExecutionDetail from 'components/ExecutionDetail.vue'

export default {
  name: 'Executions',
  components: {
    ExecutionDetail
  }
}
</script>
