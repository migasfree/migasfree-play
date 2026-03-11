<template>
  <FilterCard>
    <div class="row q-col-gutter-md items-center">
      <!-- Search Input -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="searchApp"
          dense
          filled
          class="filter-input"
          :placeholder="$gettext('Search in name or description')"
          clearable
          autofocus
          @update:model-value="appsStore.filterApps"
        >
          <template #prepend>
            <q-icon name="mdi-magnify" size="xs" />
          </template>
        </q-input>
      </div>

      <!-- Category Select -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
          v-model="selectedCategory"
          dense
          filled
          class="filter-input"
          :label="$gettext('Category')"
          :options="categories"
          option-value="id"
          option-label="name"
          clearable
          @update:model-value="appsStore.filterApps"
        />
      </div>

      <!-- Toggle -->
      <div class="col-12 col-md-4 flex justify-end items-center">
        <q-toggle
          v-model="onlyInstalledApps"
          dense
          class="filter-toggle"
          :label="$gettext('View installed apps only')"
          checked-icon="mdi-check-circle"
          unchecked-icon="mdi-apps"
          size="md"
          :false-value="false"
          :true-value="true"
          @update:model-value="appsStore.filterApps"
        />
      </div>
    </div>
  </FilterCard>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import FilterCard from 'components/FilterCard'

import { useAppsStore } from 'src/stores/apps'
import { useFiltersStore } from 'src/stores/filters'

const appsStore = useAppsStore()
const filtersStore = useFiltersStore()

const { searchApp, selectedCategory, categories, onlyInstalledApps } =
  storeToRefs(filtersStore)
</script>
