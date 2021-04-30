<template>
  <q-page id="main" padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Details')" icon="mdi-list-status" />
    </q-breadcrumbs>

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
