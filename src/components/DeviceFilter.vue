<template>
  <div class="row">
    <div class="col">
      <q-card class="q-ma-md" flat>
        <q-card-section>
          <p>
            <q-input
              v-model="filtersStore.searchDevice"
              :placeholder="$gettext('Search in name or model or manufacturer')"
              clearable
              ><template #prepend><q-icon name="mdi-magnify" /></template
            ></q-input>
          </p>

          <p>
            <q-toggle
              v-model="filtersStore.onlyAssignedDevices"
              :label="
                filtersStore.onlyAssignedDevices
                  ? $gettext('Assigned Devices')
                  : $gettext('All available')
              "
              :false-value="false"
              :true-value="true"
            />
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { useFiltersStore } from 'src/stores/filters'

export default {
  name: 'DeviceFilter',
  setup() {
    const filtersStore = useFiltersStore()

    return { filtersStore }
  },
}
</script>
