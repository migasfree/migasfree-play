<template>
  <div class="row">
    <div class="col">
      <q-card class="q-ma-sm" flat>
        <q-card-section>
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
              checked-icon="mdi-select-all"
              unchecked-icon="mdi-select"
              size="xl"
              :false-value="false"
              :true-value="true"
              @update:model-value="devicesStore.filterDevices"
            />
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { storeToRefs } from 'pinia'

import { useDevicesStore } from 'src/stores/devices'
import { useFiltersStore } from 'src/stores/filters'

export default {
  name: 'DeviceFilter',
  setup() {
    const devicesStore = useDevicesStore()
    const filtersStore = useFiltersStore()

    const { searchDevice, onlyAssignedDevices } = storeToRefs(filtersStore)

    return { devicesStore, searchDevice, onlyAssignedDevices }
  },
}
</script>
