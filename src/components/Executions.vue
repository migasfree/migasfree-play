<template>
  <div v-if="Object.keys(items).length > 0" class="q-py-md">
    <ExecutionDetail
      v-for="(item, name) in items"
      :id="name"
      :key="name"
      :command="item.command"
      :text="item.text"
      :error="item.error || ''"
      :icon="item.icon || ''"
    />
  </div>

  <BannerInfo v-else :message="$gettext('There are no items to show.')" />
</template>

<script setup>
import { storeToRefs } from 'pinia'

import BannerInfo from 'components/BannerInfo'
import ExecutionDetail from 'components/ExecutionDetail'

import { useExecutionsStore } from 'src/stores/executions'

const executionsStore = useExecutionsStore()
const { items } = storeToRefs(executionsStore)
</script>
