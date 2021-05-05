<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Tags')" icon="mdi-tag" />
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="$store.state.ui.isUpdating"
        :disabled="$store.state.ui.isUpdating"
        @click="updateTags"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </q-breadcrumbs>

    <div v-if="$store.state.ui.isUpdating" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <Tags v-else />
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
  methods: {
    async updateTags() {
      this.$store.commit('ui/updating')
      await this.$store.dispatch('tags/getAvailableTags')
      await this.$store.dispatch('tags/getAssignedTags')
      this.$store.commit('ui/updatingFinished')
    }
  }
}
</script>
