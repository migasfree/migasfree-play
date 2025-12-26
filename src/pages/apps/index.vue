<template>
  <q-page padding>
    <PageLayout
      :title="$gettext('Apps')"
      icon="apps"
      :count="filteredApps.length"
      :loading="isUpdating"
      @sync="sync"
    >
      <template #content>
        <Apps />
      </template>
    </PageLayout>
  </q-page>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Apps from 'components/Apps'
import PageLayout from 'components/PageLayout'

import { useAppsStore } from 'src/stores/apps'
import { useFiltersStore } from 'src/stores/filters'
import { usePageSync } from 'src/composables/usePageSync'

const { $gettext } = useGettext()

const appsStore = useAppsStore()
const filtersStore = useFiltersStore()

const { filteredApps } = storeToRefs(appsStore)

useMeta({ title: $gettext('Apps') })

const { isUpdating, sync } = usePageSync(async () => {
  await Promise.all([appsStore.loadApps(), filtersStore.setCategories()])
})
</script>
