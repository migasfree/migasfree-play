<template>
  <q-page padding>
    <PageLayout
      :title="$gettext('Preferences')"
      icon="mdi-cog"
      :show-count="false"
      :loading="isUpdating"
      @sync="sync"
    >
      <template #content>
        <Preferences />
      </template>
    </PageLayout>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import PageLayout from 'components/PageLayout'
import Preferences from 'components/Preferences'

import { usePreferencesStore } from 'src/stores/preferences'
import { usePageSync } from 'src/composables/usePageSync'

const { $gettext } = useGettext()

const preferencesStore = usePreferencesStore()

useMeta({ title: $gettext('Preferences') })

const { isUpdating, sync } = usePageSync(() =>
  preferencesStore.readPreferences(),
)
</script>
