<template>
  <FilterCard>
    <div class="row q-col-gutter-md items-center">
      <!-- Search Input -->
      <div class="col-12">
        <q-input
          v-model="searchApp"
          dense
          filled
          class="filter-input"
          :placeholder="$gettext('Search in name or description')"
          :aria-label="$gettext('Search in name or description')"
          clearable
          @update:model-value="appsStore.filterApps"
        >
          <template #prepend>
            <q-icon :name="appIcon('search')" size="xs" />
          </template>
        </q-input>
      </div>

      <!-- Category Select -->
      <div class="col-12 col-sm-6">
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

      <!-- Status Select -->
      <div class="col-12 col-sm-6">
        <q-select
          v-model="appStatusFilter"
          dense
          filled
          class="filter-input"
          :label="$gettext('Status')"
          :options="availableStatusOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          @update:model-value="appsStore.filterApps"
        >
          <!-- Show selected icon inline with the selected value label (as prepend) -->
          <template #selected-item="scope">
            <q-icon
              v-if="scope.opt.icon"
              :name="scope.opt.icon"
              size="xs"
              class="q-mr-xs"
            />
            <span>{{ scope.opt.label }}</span>
          </template>

          <!-- Show icons inside dropdown options list -->
          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section v-if="scope.opt.icon" avatar>
                <q-icon :name="scope.opt.icon" size="xs" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>
  </FilterCard>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'

import FilterCard from 'components/FilterCard.vue'
import { appIcon } from 'src/composables/element'

import { useAppsStore } from 'src/stores/apps'
import { useFiltersStore } from 'src/stores/filters'

const appsStore = useAppsStore()
const filtersStore = useFiltersStore()

const { $gettext } = useGettext()

const { searchApp, selectedCategory, categories, appStatusFilter } =
  storeToRefs(filtersStore)

const { presentStatuses } = storeToRefs(appsStore)

const STATUS_ORDER = ['installed', 'not_installed', 'privileged', 'unavailable']

const availableStatusOptions = computed(() => {
  const labels = {
    installed: $gettext('Installed'),
    not_installed: $gettext('Not installed'),
    privileged: $gettext('With privileges'),
    unavailable: $gettext('Not available'),
  }

  const icons = {
    installed: appIcon('success'),
    not_installed: appIcon('install'),
    privileged: appIcon('unlock'),
    unavailable: appIcon('unavailable'),
  }

  const options = [
    { value: null, label: $gettext('All'), icon: appIcon('apps') },
  ]
  STATUS_ORDER.forEach((key) => {
    if (presentStatuses.value.has(key)) {
      options.push({ value: key, label: labels[key], icon: icons[key] })
    }
  })
  return options
})
</script>
