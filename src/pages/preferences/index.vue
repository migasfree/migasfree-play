<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el :label="$gettext('Preferences')" icon="mdi-cog" />
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="isUpdating"
        :disabled="isUpdating"
        @click="updatePreferences"
        >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </q-breadcrumbs>

    <div v-if="isUpdating" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <Preferences v-else />
  </q-page>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Preferences from 'components/Preferences.vue'

import { usePreferencesStore } from 'src/stores/preferences'
import { useUiStore } from 'src/stores/ui'

export default {
  components: {
    Preferences,
  },
  setup() {
    const { $gettext } = useGettext()

    const preferencesStore = usePreferencesStore()
    const uiStore = useUiStore()

    const { isUpdating } = storeToRefs(uiStore)

    useMeta({ title: $gettext('Preferences') })

    const updatePreferences = async () => {
      uiStore.updating()
      await preferencesStore.readPreferences()
      uiStore.updatingFinished()
    }

    return { isUpdating, updatePreferences }
  },
}
</script>
