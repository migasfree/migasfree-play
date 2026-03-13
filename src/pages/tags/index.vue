<template>
  <q-page padding>
    <PageLayout
      :title="$gettext('Tags')"
      :icon="appIcon('tags')"
      :show-count="false"
      :loading="isUpdating"
      @sync="sync"
    >
      <template #content>
        <Tags />
      </template>
    </PageLayout>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import PageLayout from 'components/PageLayout'
import Tags from 'components/Tags'

import { useTagsStore } from 'src/stores/tags'
import { usePageSync } from 'src/composables/usePageSync'
import { appIcon } from 'src/composables/element'

const { $gettext } = useGettext()

const tagsStore = useTagsStore()

useMeta({ title: $gettext('Tags') })

const { isUpdating, sync } = usePageSync(() => tagsStore.getTags())
</script>
