<template>
  <div>
    <DeviceFilter />

    <div class="row justify-between q-gutter-md">
      <DeviceDetail
        v-for="item in devicesByFilter"
        :id="item.name"
        :key="item.id"
        :icon="icon(item.connection.name)"
        :name="name(item)"
        :connection="item.connection.name"
        :description="description(item.data)"
        :ip="ipAddress(item.data)"
        :logical="item.logical"
      />
    </div>
  </div>
</template>

<script>
import DeviceFilter from 'components/DeviceFilter.vue'
import DeviceDetail from 'components/DeviceDetail.vue'

export default {
  name: 'Devices',
  components: {
    DeviceFilter,
    DeviceDetail
  },
  data() {
    return {
      devices: []
    }
  },
  computed: {
    devicesByFilter() {
      let results = this.devices

      if (this.$store.state.filters.searchDevice)
        results = results.filter(
          (device) =>
            device.model.name
              .toLowerCase()
              .includes(this.$store.state.filters.searchDevice) ||
            ('NAME' in device.data &&
              device.data.NAME.toLowerCase().includes(
                this.$store.state.filters.searchDevice
              ))
        )

      if (this.$store.state.filters.onlyAssignedDevices)
        results = results.filter((device) => {
          return (
            this.$store.state.devices.assigned.filter((x) => {
              return x.device.id === device.id
            }).length !== 0
          )
        })

      return results
    }
  },
  mounted() {
    this.$store.dispatch('devices/getFeaturesDevices') // FIXME I don't know why!!!
    this.devices = this.$store.getters['devices/getAvailableDevices']
  },
  methods: {
    name(item) {
      return 'NAME' in item.data
        ? item.data.NAME
        : `${item.model.manufacturer.name} ${item.model.name}`
    },

    icon(connection) {
      return connection === 'TCP'
        ? 'img/printer-net.png'
        : 'img/printer-local.png'
    },

    ipAddress(value) {
      return value.IP || ''
    },

    description(value) {
      return value.LOCATION || ''
    }
  }
}
</script>
