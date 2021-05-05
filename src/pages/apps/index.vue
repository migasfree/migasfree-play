<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Apps')" icon="apps" />
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="$store.state.ui.isUpdating"
        :disabled="$store.state.ui.isUpdating"
        @click="updateApps"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </q-breadcrumbs>

    <div v-if="$store.state.ui.isUpdating" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <Apps v-else />
  </q-page>
</template>

<script>
import Apps from 'components/Apps.vue'

export default {
  meta() {
    return {
      title: this.$gettext('Apps')
    }
  },
  components: {
    Apps
  },
  methods: {
    async updateApps() {
      this.$store.commit('ui/updating')
      await this.$store.dispatch('app/getApps')
      await this.$store.dispatch('filters/setCategories')
      this.$store.commit('ui/updatingFinished')
    }
  }
}
</script>
