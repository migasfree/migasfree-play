<template>
  <q-page padding>
    <PageHeader :title="$gettext('Info')" icon="info" class="print-hide">
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
    </PageHeader>

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

import Info from 'components/Info'
import PageHeader from 'components/PageHeader'

import { useComputerStore } from 'src/stores/computer'
import { usePackagesStore } from 'src/stores/packages'
import { useUiStore } from 'src/stores/ui'

export default {
  components: {
    Info,
    PageHeader,
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
      try {
        await Promise.all([
          computerStore.computerInfo(),
          computerStore.computerNetwork(),
          computerStore.computerId(),
          computerStore.computerData(),
          computerStore.computerAttribute(),
          packagesStore.setInventory(),
        ])
      } finally {
        uiStore.updatingFinished()
      }
    }

    return { isUpdating, updateInfo }
  },
}
</script>
