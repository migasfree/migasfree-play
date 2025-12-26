<template>
  <DeviceFilter />

  <template v-if="filteredDevices.length > 0">
    <div class="row">
      <DeviceDetail
        v-for="item in paginatedItems"
        :id="item.name"
        :key="item.id"
        :name="name(item)"
        :alternative-name="alternativeName(item)"
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

  <BannerInfo v-else :message="$gettext('There are not items to show.')" />
</template>

<script setup>
import { storeToRefs } from 'pinia'

import BannerInfo from 'components/BannerInfo'
import DeviceFilter from 'components/DeviceFilter'
import DeviceDetail from 'components/DeviceDetail'
import Pagination from 'components/Pagination'

import { useDevicesStore } from 'src/stores/devices'
import { usePagination } from 'src/composables/usePagination'

const devicesStore = useDevicesStore()

const { filteredDevices } = storeToRefs(devicesStore)

const { paginatedItems, pageChanged } = usePagination(filteredDevices)

const name = (item) => {
  return item.data?.NAME ?? `${item.model.manufacturer.name} ${item.model.name}`
}

const alternativeName = (item) => {
  return 'NAME' in item.data
    ? `${item.model.manufacturer.name} ${item.model.name}`
    : ''
}

const ipAddress = (value) => {
  return value.IP || ''
}

const description = (value) => {
  return value.LOCATION || ''
}
</script>
