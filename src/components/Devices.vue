<template>
  <div>
    <DeviceFilter />

    <div v-if="devicesByFilter.length > 0" class="row">
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
    <q-banner v-else class="bg-info text-black q-ma-md">
      <template #avatar>
        <q-icon name="mdi-information-outline" color="white" />
      </template>
      {{ $gettext('There are not items to show.') }}
    </q-banner>
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

      if (this.$store.state.filters.searchDevice) {
        const pattern = this.$store.state.filters.searchDevice.toLowerCase()

        results = results.filter(
          (device) =>
            device.model.name.toLowerCase().includes(pattern) ||
            device.model.manufacturer.name.toLowerCase().includes(pattern) ||
            ('NAME' in device.data &&
              device.data.NAME.toLowerCase().includes(pattern))
        )
      }

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
    this.devices = this.$store.getters['devices/getAvailableDevices']
  },
  methods: {
    name(item) {
      return 'NAME' in item.data && item.data.NAME
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
