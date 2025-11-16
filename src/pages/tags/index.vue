<template>
  <q-page padding>
    <PageHeader :title="$gettext('Tags')" icon="mdi-tag">
      <q-btn
        icon="mdi-sync"
        size="sm"
        flat
        color="primary"
        :loading="isUpdating"
        :disabled="isUpdating"
        @click="updateTags"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
      >
    </PageHeader>

    <div v-if="isUpdating" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <Tags v-else />
  </q-page>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import PageHeader from 'components/PageHeader'
import Tags from 'components/Tags'

import { useTagsStore } from 'src/stores/tags'
import { useUiStore } from 'src/stores/ui'

export default {
  components: {
    PageHeader,
    Tags,
  },
  setup() {
    const { $gettext } = useGettext()

    const tagsStore = useTagsStore()
    const uiStore = useUiStore()
    const { isUpdating } = storeToRefs(uiStore)

    useMeta({ title: $gettext('Tags') })

    const updateTags = async () => {
      uiStore.updating()
      try {
        await Promise.all([
          tagsStore.getAvailableTags(),
          tagsStore.getAssignedTags(),
        ])
      } finally {
        uiStore.updatingFinished()
      }
    }

    return { isUpdating, updateTags }
  },
}
</script>
