<template>
  <q-page padding>
    <q-breadcrumbs class="print-hide">
      <q-breadcrumbs-el :label="$gettext('Info')" icon="info" />
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="$store.state.ui.isUpdating"
        :disabled="$store.state.ui.isUpdating"
        @click="updateInfo"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </q-breadcrumbs>

    <div v-if="$store.state.ui.isUpdating" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <Info v-else />
  </q-page>
</template>

<script>
import { useStore } from 'vuex'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Info from 'components/Info.vue'

export default {
  components: {
    Info,
  },
  setup() {
    const store = useStore()
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Info') })

    const updateInfo = async () => {
      store.commit('ui/updating')
      await store.dispatch('computer/computerInfo')
      await store.dispatch('computer/computerNetwork')
      await store.dispatch('computer/computerId')
      await store.dispatch('computer/computerData')
      await store.dispatch('computer/computerAttribute')
      store.commit('ui/updatingFinished')
    }

    return { updateInfo }
  },
}
</script>
