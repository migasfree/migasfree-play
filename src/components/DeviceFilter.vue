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
export default {
  name: 'DeviceFilter',
  data() {
    return {
      searchDevice: '',
      onlyAssignedDevices: false,
    }
  },
  mounted() {
    this.searchDevice = this.$store.state.filters.searchDevice
    this.onlyAssignedDevices = this.$store.state.filters.onlyAssignedDevices
  },
  methods: {
    setSearchDevice() {
      this.$store.commit('filters/setSearchDevice', this.searchDevice)
    },

    setOnlyAssignedDevices() {
      this.$store.commit(
        'filters/setOnlyAssignedDevices',
        this.onlyAssignedDevices
      )
    },
  },
}
</script>
