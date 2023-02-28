<template>
  <DeviceFilter />

  <div v-if="filteredDevices.length > 0" class="row">
    <DeviceDetail
      v-for="item in filteredDevices"
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
import { storeToRefs } from 'pinia'

import DeviceFilter from 'components/DeviceFilter.vue'
import DeviceDetail from 'components/DeviceDetail.vue'

import { useDevicesStore } from 'src/stores/devices'

export default {
  name: 'Devices',
  components: {
    DeviceFilter,
    DeviceDetail,
  },
  setup() {
    const devicesStore = useDevicesStore()
    const { filteredDevices } = storeToRefs(devicesStore)

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

    return { filteredDevices, name, icon, ipAddress, description }
  },
}
</script>
