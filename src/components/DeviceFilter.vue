<template>
  <FilterCard>
    <div class="row q-col-gutter-md items-center">
      <!-- Search Input -->
      <div class="col-12 col-md-8">
        <q-input
          v-model="searchDevice"
          dense
          filled
          class="filter-input"
          :placeholder="$gettext('Search in name, model or manufacturer')"
          :aria-label="$gettext('Search in name, model or manufacturer')"
          clearable
          @update:model-value="devicesStore.filterDevices"
        >
          <template #prepend>
            <q-icon :name="appIcon('search')" size="xs" />
          </template>
        </q-input>
      </div>

      <!-- Toggle -->
      <div class="col-12 col-md-4 flex justify-end items-center">
        <q-toggle
          v-model="onlyAssignedDevices"
          dense
          class="filter-toggle"
          :label="$gettext('View assigned devices only')"
          :checked-icon="appIcon('success')"
          :unchecked-icon="appIcon('devices_settings')"
          size="md"
          :false-value="false"
          :true-value="true"
          @update:model-value="devicesStore.filterDevices"
        />
      </div>
    </div>
  </FilterCard>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import FilterCard from 'components/FilterCard'
import { appIcon } from 'src/composables/element'

import { useDevicesStore } from 'src/stores/devices'
import { useFiltersStore } from 'src/stores/filters'

const devicesStore = useDevicesStore()
const filtersStore = useFiltersStore()

const { searchDevice, onlyAssignedDevices } = storeToRefs(filtersStore)
</script>
