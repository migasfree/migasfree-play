<template>
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
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

import DeviceFilter from 'components/DeviceFilter.vue'
import DeviceDetail from 'components/DeviceDetail.vue'

export default {
  name: 'Devices',
  components: {
    DeviceFilter,
    DeviceDetail,
  },
  setup() {
    const store = useStore()

    const devices = ref([])

    const devicesByFilter = computed(() => {
      let results = devices.value

      if (store.state.filters.searchDevice) {
        const pattern = store.state.filters.searchDevice.toLowerCase()

        results = results.filter(
          (device) =>
            device.model.name.toLowerCase().includes(pattern) ||
            device.model.manufacturer.name.toLowerCase().includes(pattern) ||
            ('NAME' in device.data &&
              device.data.NAME.toLowerCase().includes(pattern))
        )
      }

      if (store.state.filters.onlyAssignedDevices)
        results = results.filter((device) => {
          return (
            store.state.devices.assigned.filter((x) => {
              return x.device.id === device.id
            }).length !== 0
          )
        })

      return results
    })

    const name = (item) => {
      return 'NAME' in item.data && item.data.NAME
        ? item.data.NAME
        : `${item.model.manufacturer.name} ${item.model.name}`
    }

    const icon = (connection) => {
      return connection === 'TCP'
        ? 'img/printer-net.png'
        : 'img/printer-local.png'
    }

    const ipAddress = (value) => {
      return value.IP || ''
    }

    const description = (value) => {
      return value.LOCATION || ''
    }

    onMounted(() => {
      devices.value = store.getters['devices/getAvailableDevices']
    })

    return { devices, devicesByFilter, name, icon, ipAddress, description }
  },
}
</script>
