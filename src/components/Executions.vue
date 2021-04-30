<template>
  <q-list>
    <ExecutionDetail
      v-for="(item, name, index) in $store.state.executions.log"
      :id="name"
      :key="index"
      :command="item.command"
      :text="item.text"
    />
  </q-list>
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
