<template>
  <q-page id="main" padding>
    <PageLayout
      :title="$gettext('Details')"
      icon="mdi-list-status"
      :count="count"
      :show-sync="false"
    >
      <template #content>
        <Executions />
      </template>
    </PageLayout>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { storeToRefs } from 'pinia'

import Executions from 'components/Executions'
import PageLayout from 'components/PageLayout'

import { useExecutionsStore } from 'src/stores/executions'

const { $gettext } = useGettext()

const executionsStore = useExecutionsStore()
const { items } = storeToRefs(executionsStore)

useMeta({ title: $gettext('Details') })

const count = computed(() => Object.keys(items.value).length)
</script>
