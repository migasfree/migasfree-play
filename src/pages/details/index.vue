<template>
  <q-page id="main" padding>
    <Executions />
  </q-page>
</template>

<script>
import Executions from 'components/Executions.vue'

export default {
  meta() {
    return {
      title: this.$gettext('Details')
    }
  },
  components: {
    Executions
  }
}
</script>
