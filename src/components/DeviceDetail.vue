<template>
  <div class="col-md-6 col-sm-6 col-xs-12 q-pa-sm">
    <q-card flat bordered>
      <q-card-section horizontal>
        <q-card-section class="col-9">
          <div class="text-h5">
            {{ name }}
          </div>
          <q-tooltip>{{ tooltip }}</q-tooltip>
          <div class="text-caption text-blue-grey">
            {{ id }}
          </div>
        </q-card-section>

        <q-card-section class="col-3 text-center">
          <img :src="icon" />
        </q-card-section>
      </q-card-section>

      <q-card-section>
        {{ description }}
      </q-card-section>

      <template v-if="logical">
        <q-separator inset />
        <q-card-section v-for="item in visibleLogicalDevices" :key="item.id">
          <span class="feature">{{ capabilityName(item) }}</span>
          <template v-if="isAssigned(item.id)">
            <q-chip outline color="primary" text-color="white">
              {{ $gettext('Assigned') }}
            </q-chip>

            <q-btn
              color="negative"
              icon="mdi-delete"
              class="float-right"
              size="md"
              :loading="isRunningCommand"
              :disabled="isRunningCommand"
              @click="removeDevice(item)"
            >
              <q-tooltip>{{ $gettext('Uninstall') }}</q-tooltip>
            </q-btn>
          </template>

          <q-btn
            v-else
            color="positive"
            icon="mdi-download"
            class="float-right"
            size="md"
            :loading="isRunningCommand"
            :disabled="isRunningCommand"
            @click="installDevice(item)"
          >
            <q-tooltip>{{ $gettext('Install') }}</q-tooltip>
          </q-btn>
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useComputerStore } from 'src/stores/computer'
import { useDevicesStore } from 'src/stores/devices'
import { useExecutionsStore } from 'src/stores/executions'
import { useFiltersStore } from 'src/stores/filters'
import { useProgramStore } from 'src/stores/program'

export default {
  name: 'DeviceDetail',
  props: {
    icon: { type: String, required: true },
    name: { type: String, required: true },
    id: { type: String, required: true },
    connection: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    ip: { type: String, required: false, default: '' },
    logical: { type: Array, required: false, default: () => [] },
  },
  setup(props) {
    const computerStore = useComputerStore()
    const devicesStore = useDevicesStore()
    const executionsStore = useExecutionsStore()
    const filtersStore = useFiltersStore()
    const programStore = useProgramStore()

    const { isRunningCommand } = storeToRefs(executionsStore)

    const tooltip = computed(() => {
      if (props.ip) return `${props.connection} (${props.ip})`
      else return props.connection
    })

    const logical = computed(() => JSON.parse(JSON.stringify(props.logical)))

    const visibleLogicalDevices = computed(() => {
      if (!filtersStore.onlyAssignedDevices) return logical.value
      else
        return logical.value.filter((item) => {
          return isAssigned(item.id)
        })
    })

    const capabilityName = (item) => {
      if (programStore.serverVersion.startsWith('4.'))
        return item.alternative_feature_name || item.feature.name
      return item.alternative_capability_name || item.capability.name
    }

    const isAssigned = (id) => {
      return (
        devicesStore.assigned.find((item) => {
          return item.id === id
        }) ||
        devicesStore.inflicted.find((item) => {
          return item.id === id
        })
      )
    }

    const installDevice = (item) => {
      let attributes = item.attributes.map((value) => value.id)
      if (programStore.serverVersion.startsWith('4.'))
        attributes = item.attributes.slice()

      if (!attributes.includes(computerStore.attribute)) {
        attributes.push(computerStore.attribute)
      }
      devicesStore.changeDeviceAttributes({
        id: item.id,
        attributes,
      })
      devicesStore.addAssignedDevice({
        id: item.id,
        device: item.device,
        capability: item.capability,
      })
    }

    const removeDevice = (item) => {
      let attributes = item.attributes.map((value) => value.id)
      if (programStore.serverVersion.startsWith('4.'))
        attributes = item.attributes.slice()

      attributes = attributes.filter((x) => x !== computerStore.attribute)
      devicesStore.changeDeviceAttributes({
        id: item.id,
        attributes,
      })
      devicesStore.removeAssignedDevice(item.id)
    }

    return {
      isRunningCommand,
      tooltip,
      visibleLogicalDevices,
      capabilityName,
      isAssigned,
      installDevice,
      removeDevice,
    }
  },
}
</script>
