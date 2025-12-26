<template>
  <FilterCard>
    <p>
      <q-input
        v-model="searchDevice"
        :placeholder="$gettext('Search in name or model or manufacturer')"
        clearable
        @update:model-value="devicesStore.filterDevices"
        ><template #prepend><q-icon name="mdi-magnify" /></template
      ></q-input>
    </p>

    <p>
      <q-toggle
        v-model="onlyAssignedDevices"
        :label="
          onlyAssignedDevices
            ? $gettext('View All available')
            : $gettext('View Assigned Devices')
        "
        checked-icon="mdi-checkbox-marked"
        unchecked-icon="mdi-select"
        size="xl"
        :false-value="false"
        :true-value="true"
        @update:model-value="devicesStore.filterDevices"
      />
    </p>
  </FilterCard>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import FilterCard from 'components/FilterCard'

import { useDevicesStore } from 'src/stores/devices'
import { useFiltersStore } from 'src/stores/filters'

const devicesStore = useDevicesStore()
const filtersStore = useFiltersStore()

const { searchDevice, onlyAssignedDevices } = storeToRefs(filtersStore)
</script>
