<template>
  <div v-if="total > resultsPerPage" class="pagination-container q-py-lg">
    <div class="glass-pagination flex items-center justify-center q-px-sm">
      <q-pagination
        v-model="currentPage"
        dense
        :max="pagesCount"
        :max-pages="5"
        direction-links
        boundary-links
        icon-first="mdi-page-first"
        icon-last="mdi-page-last"
        icon-prev="mdi-chevron-left"
        icon-next="mdi-chevron-right"
        color="primary"
        active-color="accent"
        active-text-color="primary"
        flat
        round
        gutter="md"
        @update:model-value="customPageChange"
      />
    </div>
  </div>
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

const customPageChange = (val) => {
  props.pageChanged(val)
}

watch(
  () => props.total,
  (value) => {
    if (value <= resultsPerPage) currentPage.value = 1
  },
)
</script>

<style lang="scss" scoped>
.pagination-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.glass-pagination {
  background: var(--surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 50px;
  padding: 6px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  min-width: 380px;
  transition: all 0.3s ease;

  @media (max-width: 600px) {
    min-width: 100%;
    flex-direction: column;
    padding: 12px;
    border-radius: 16px;
    gap: 8px;
  }

  // Base pagination button styles
  :deep(.q-pagination) {
    .q-btn {
      font-weight: 500;
      transition: all 0.2s ease;
      min-width: 36px;
      height: 36px;
      color: var(--q-primary) !important;

      &:hover {
        background: rgba(var(--q-primary-rgb), 0.1) !important;
      }
    }

    .q-pagination__content--active {
      .q-btn {
        background: var(--q-accent) !important;
        color: var(--q-primary) !important;
        font-weight: 800;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

.body--dark {
  .glass-pagination {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  :deep(.q-pagination) {
    .q-btn {
      color: rgba(255, 255, 255, 0.7) !important;

      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }
    }

    .q-pagination__content--active {
      .q-btn {
        background: var(--q-accent) !important;
        color: var(--q-primary) !important;
        box-shadow: 0 0 20px rgba(var(--q-accent-rgb), 0.4);
      }
    }
  }
}
</style>
