<template>
  <q-pagination
    v-if="total > resultsPerPage"
    v-model="currentPage"
    size="lg"
    direction-links
    boundary-links
    :max="pagesCount"
    icon-first="mdi-page-first"
    icon-last="mdi-page-last"
    @update:model-value="customPageChange(currentPage)"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import { resultsPerPage } from 'config/app.conf'

const props = defineProps({
  total: {
    type: Number,
    required: true,
  },
  pageChanged: {
    type: Function,
    required: true,
  },
})

const currentPage = ref(1)

const pagesCount = computed(() => Math.ceil(props.total / resultsPerPage))

const customPageChange = (customCurrentPage) => {
  props.pageChanged(customCurrentPage ? customCurrentPage : currentPage.value)
}

watch(
  () => props.total,
  (value) => {
    if (value <= resultsPerPage) currentPage.value = 1
  },
)
</script>
