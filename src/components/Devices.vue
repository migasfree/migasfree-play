<template>
  <DeviceFilter />

  <template v-if="filteredDevices.length > 0">
    <div class="row">
      <DeviceDetail
        v-for="item in filteredDevices"
        :id="item.name"
        :key="item.id"
        :name="name(item)"
        :connection="item.connection.name"
        :description="description(item.data)"
        :ip="ipAddress(item.data)"
        :logical="item.logical"
      />
    </div>

    <Pagination
      class="justify-center"
      :total="filteredDevices.length"
      :page-changed="pageChanged"
    />
  </template>
  <q-banner v-else class="bg-info text-black q-ma-md">
    <template #avatar>
      <q-icon name="mdi-information-outline" color="white" />
    </template>
    {{ $gettext('There are not items to show.') }}
  </q-banner>
</template>

<script>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import DeviceFilter from 'components/DeviceFilter'
import DeviceDetail from 'components/DeviceDetail'
import Pagination from 'components/Pagination'

import { useDevicesStore } from 'src/stores/devices'
import { useUiStore } from 'src/stores/ui'

import { resultsPerPage } from 'config/app.conf'

export default {
  name: 'Devices',
  components: {
    DeviceFilter,
    DeviceDetail,
    Pagination,
  },
  setup() {
    const devicesStore = useDevicesStore()
    const uiStore = useUiStore()

    const { filteredDevices } = storeToRefs(devicesStore)
    const paginatedDevices = ref(filteredDevices.value.slice(0, resultsPerPage))

    const name = (item) => {
      return 'NAME' in item.data && item.data.NAME
        ? item.data.NAME
        : `${item.model.manufacturer.name} ${item.model.name}`
    }

    const ipAddress = (value) => {
      return value.IP || ''
    }

    const description = (value) => {
      return value.LOCATION || ''
    }

    const pageChanged = (currentPage = 1) => {
      const start = (currentPage - 1) * resultsPerPage
      const end = start + resultsPerPage

      paginatedDevices.value = filteredDevices.value.slice(start, end)

      setTimeout(() => {
        uiStore.scrollToElement(document.getElementById('main'))
      }, 250)
    }

    watch(filteredDevices, () => {
      pageChanged()
    })

    return {
      filteredDevices,
      paginatedDevices,
      name,
      ipAddress,
      description,
      pageChanged,
    }
  },
}
</script>
