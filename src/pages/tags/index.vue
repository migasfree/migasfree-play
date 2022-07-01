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
import { useStore } from 'vuex'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Tags from 'components/Tags'

export default {
  components: {
    Tags,
  },
  setup() {
    const store = useStore()
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Tags') })

    const updateTags = async () => {
      store.commit('ui/updating')
      await store.dispatch('tags/getAvailableTags')
      await store.dispatch('tags/getAssignedTags')
      store.commit('ui/updatingFinished')
    }

    return { updateTags }
  },
}
</script>
