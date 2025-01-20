<template>
  <div class="col-md-6 col-sm-6 col-xs-12 q-pa-sm">
    <q-card flat bordered>
      <q-card-section horizontal>
        <q-card-section class="col-9">
          <div class="text-h5">
            {{ name }}
          </div>
          <div class="text-caption text-blue-grey">
            {{ id }} {{ alternativeName ? `(${alternativeName})` : '' }}
          </div>
        </q-card-section>

        <q-card-section class="col-3 text-right">
          <q-icon
            :name="
              connection === 'TCP' ? 'mdi-printer-pos-network' : 'mdi-printer'
            "
            size="64px"
          />
        </q-card-section>

        <q-tooltip>{{ tooltip }}</q-tooltip>
      </q-card-section>

      <q-card-section v-if="description">
        <q-icon name="mdi-map-marker" size="md" /> {{ description }}
      </q-card-section>

      <template v-if="logical">
        <q-separator inset />
        <q-card-section v-for="item in visibleLogicalDevices" :key="item.id">
          <template v-if="isPredetermined(item)">
            <q-icon name="mdi-star" size="md" color="info">
              <q-tooltip>
                {{ $gettext('Predetermined') }}
              </q-tooltip>
            </q-icon>
          </template>

          <span class="feature">{{ capabilityName(item) }}</span>

          <template v-if="isInflicted(item)">
            <q-icon name="mdi-link-variant" size="md" color="info">
              <q-tooltip>
                {{ $gettext('Inflicted') }}
              </q-tooltip>
            </q-icon>
          </template>

          <template v-if="isAssigned(item)">
            <q-icon name="mdi-checkbox-marked" size="md" color="info">
              <q-tooltip>
                {{ $gettext('Assigned') }}
              </q-tooltip>
            </q-icon>

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

            <!-- q-btn
              v-if="!isPredetermined(item)"
              color="primary"
              class="float-right q-mx-md"
              icon="mdi-star"
              size="md"
              :loading="isRunningCommand"
              :disabled="isRunningCommand"
              @click="predetermine(item.id)"
            >
              <q-tooltip>{{ $gettext('Predetermine') }}</q-tooltip>
            </q-btn -->
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
    name: { type: String, required: true },
    alternativeName: { type: String, required: true },
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
          return isAssigned(item)
        })
    })

    const capabilityName = (item) => {
      if (programStore.serverVersion.startsWith('4.'))
        return item.alternative_feature_name || item.feature.name
      return item.alternative_capability_name || item.capability.name
    }

    const isAssigned = (item) => {
      return item['x-type'] === 'assigned'
    }

    const isInflicted = (item) => {
      return item['x-type'] === 'inflicted'
    }

    const isPredetermined = (item) => {
      return item['x-is-default'] === true
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
        device: item.device.id,
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
      devicesStore.removeAssignedDevice({
        id: item.id,
        device: item.device.id,
      })
    }

    const predetermine = (id) => {
      devicesStore.setDefaultLogicalDevice(id)
    }

    return {
      isRunningCommand,
      tooltip,
      visibleLogicalDevices,
      capabilityName,
      isAssigned,
      isInflicted,
      isPredetermined,
      installDevice,
      removeDevice,
      predetermine,
    }
  },
}
</script>
