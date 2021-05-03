<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Tags')" icon="mdi-tag" />
    </q-breadcrumbs>

    <Tags />
  </q-page>
</template>

<script>
import Tags from 'components/Tags'

export default {
  meta() {
    return {
      title: this.$gettext('Tags')
    }
  },
  components: {
    Tags
  }
}
</script>
