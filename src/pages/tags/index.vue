<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Tags')" icon="mdi-tag" />
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="updating"
        :disabled="updating"
        @click="updateTags"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
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
  },
  data() {
    return {
      updating: false
    }
  },
  methods: {
    async updateTags() {
      this.updating = true
      await this.$store.dispatch('tags/getAvailableTags')
      await this.$store.dispatch('tags/getAssignedTags')
      this.updating = false
    }
  }
}
</script>
