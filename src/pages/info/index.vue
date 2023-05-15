<template>
  <q-page padding>
    <q-breadcrumbs class="print-hide">
      <q-breadcrumbs-el :label="$gettext('Info')" icon="info" />
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="isUpdating"
        :disabled="isUpdating"
        @click="updateInfo"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </q-breadcrumbs>

    <div v-if="isUpdating" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <Info v-else />
  </q-page>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Info from 'components/Info.vue'

import { useComputerStore } from 'src/stores/computer'
import { usePackagesStore } from 'src/stores/packages'
import { useUiStore } from 'src/stores/ui'

export default {
  components: {
    Info,
  },
  setup() {
    const { $gettext } = useGettext()

    const computerStore = useComputerStore()
    const packagesStore = usePackagesStore()
    const uiStore = useUiStore()

    const { isUpdating } = storeToRefs(uiStore)

    useMeta({ title: $gettext('Info') })

    const updateInfo = async () => {
      uiStore.updating()
      await computerStore.computerInfo()
      await computerStore.computerNetwork()
      await computerStore.computerId()
      await computerStore.computerData()
      await computerStore.computerAttribute()
      await packagesStore.setInventory()
      uiStore.updatingFinished()
    }

    return { isUpdating, updateInfo }
  },
}
</script>
