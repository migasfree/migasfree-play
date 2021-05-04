<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Apps')" icon="apps" />
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="updating"
        :disabled="updating"
        @click="updateApps"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </q-breadcrumbs>

    <Apps />
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
  data() {
    return {
      updating: false
    }
  },
  methods: {
    async updateApps() {
      this.updating = true
      await this.$store.dispatch('app/getApps')
      await this.$store.dispatch('filters/setCategories')
      this.updating = false
    }
  }
}
</script>
