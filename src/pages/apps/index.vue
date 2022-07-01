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
import { useStore } from 'vuex'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Apps from 'components/Apps.vue'

export default {
  components: {
    Apps,
  },
  setup() {
    const store = useStore()
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Apps') })

    const updateApps = async () => {
      store.commit('ui/updating')
      await store.dispatch('app/getApps')
      await store.dispatch('filters/setCategories')
      store.commit('ui/updatingFinished')
    }

    return { updateApps }
  },
}
</script>
