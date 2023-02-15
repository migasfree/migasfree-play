<template>
  <div class="row">
    <div class="col">
      <q-card class="q-ma-md" flat>
        <q-card-section>
          <p>
            <q-input
              v-model="searchDevice"
              :placeholder="$gettext('Search in name or model or manufacturer')"
              clearable
              @update:model-value="setSearchDevice"
              ><template #prepend><q-icon name="mdi-magnify" /></template
            ></q-input>
          </p>

          <p>
            <q-toggle
              v-model="onlyAssignedDevices"
              :label="
                onlyAssignedDevices
                  ? $gettext('Assigned Devices')
                  : $gettext('All available')
              "
              :false-value="false"
              :true-value="true"
              @update:model-value="setOnlyAssignedDevices"
            />
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

import { useFiltersStore } from 'src/stores/filters'

export default {
  name: 'DeviceFilter',
  setup() {
    const filtersStore = useFiltersStore()

    const searchDevice = ref('')
    const onlyAssignedDevices = ref(false)

    const setSearchDevice = () => {
      filtersStore.setSearchDevice(searchDevice.value)
    }

    const setOnlyAssignedDevices = () => {
      filtersStore.setOnlyAssignedDevices(onlyAssignedDevices.value)
    }

    onMounted(() => {
      searchDevice.value = filtersStore.searchDevice
      onlyAssignedDevices.value = filtersStore.onlyAssignedDevices
    })

    return {
      searchDevice,
      onlyAssignedDevices,
      setSearchDevice,
      setOnlyAssignedDevices,
    }
  },
}
</script>
