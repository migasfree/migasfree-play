<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Apps')" icon="apps" />

      <div v-if="filteredApps.length > 0" class="row items-center q-ml-xs">
        <q-chip
          outline
          color="primary"
          text-color="white"
          class="text-right"
          size="sm"
        >
          {{ filteredApps.length }}
        </q-chip>
      </div>

      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="isUpdating"
        :disabled="isUpdating"
        @click="updateApps"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </q-breadcrumbs>

    <div v-if="isUpdating" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <Apps v-else />
  </q-page>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Apps from 'components/Apps'

import { useAppsStore } from 'src/stores/apps'
import { useFiltersStore } from 'src/stores/filters'
import { useUiStore } from 'src/stores/ui'

export default {
  components: {
    Apps,
  },
  setup() {
    const { $gettext } = useGettext()

    const appsStore = useAppsStore()
    const filtersStore = useFiltersStore()
    const uiStore = useUiStore()

    const { filteredApps } = storeToRefs(appsStore)
    const { isUpdating } = storeToRefs(uiStore)

    useMeta({ title: $gettext('Apps') })

    const updateApps = async () => {
      uiStore.updating()
      try {
        await Promise.all([appsStore.loadApps(), filtersStore.setCategories()])
      } finally {
        uiStore.updatingFinished()
      }
    }

    return { isUpdating, updateApps, filteredApps }
  },
}
</script>
