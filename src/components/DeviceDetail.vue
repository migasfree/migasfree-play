<template>
  <div class="col-md-6 col-sm-6 col-xs-12 q-pa-sm">
    <q-card flat bordered>
      <q-card-section horizontal>
        <q-card-section class="col-8">
          <div class="text-h5 ellipsis">
            {{ name }}
            <q-tooltip>{{ name }}</q-tooltip>
          </div>
          <div class="text-caption text-blue-grey">
            {{ id }} {{ alternativeName ? `(${alternativeName})` : '' }}
          </div>
          <div v-if="description" class="text-caption text-grey-8 q-mt-sm">
            <q-icon name="mdi-map-marker" /> {{ description }}
          </div>
        </q-card-section>

        <q-card-section class="col-4 text-right">
          <q-icon
            :name="
              connection === 'TCP' ? 'mdi-printer-pos-network' : 'mdi-printer'
            "
            size="72px"
            color="primary"
          >
            <q-tooltip>
              {{ connection }} <span v-if="ip">({{ ip }})</span>
            </q-tooltip>
          </q-icon>
        </q-card-section>
      </q-card-section>

      <q-separator inset />

      <q-card-section class="q-pa-none">
        <q-list separator>
          <q-item v-for="item in visibleLogicalDevices" :key="item.id">
            <q-item-section avatar>
              <q-icon
                name="mdi-format-list-bulleted-type"
                size="md"
                color="grey-7"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ capabilityName(item) }}</q-item-label>
              <q-item-label
                v-if="isPredetermined(item)"
                caption
                class="text-info"
              >
                <q-icon name="mdi-star" size="xs" /> {{ $gettext('Default') }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center q-gutter-x-sm">
                <!-- Assigned Status -->
                <Transition name="bounce">
                  <q-chip
                    v-if="isAssigned(item)"
                    color="positive"
                    text-color="white"
                    icon="mdi-check-circle"
                    outline
                    dense
                  >
                    {{ $gettext('Assigned') }}
                  </q-chip>
                </Transition>

                <!-- Inflicted Status -->
                <q-chip
                  v-if="isInflicted(item)"
                  color="info"
                  text-color="white"
                  icon="mdi-link-variant"
                  dense
                >
                  {{ $gettext('Policy') }}
                </q-chip>

                <!-- Actions -->
                <q-btn
                  v-if="isAssigned(item)"
                  flat
                  round
                  dense
                  color="negative"
                  icon="mdi-delete"
                  :loading="isRunningCommand"
                  :disabled="isRunningCommand"
                  @click="removeDevice(item)"
                >
                  <q-tooltip>{{ $gettext('Uninstall') }}</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="isAvailable(item)"
                  flat
                  round
                  dense
                  color="positive"
                  icon="mdi-download"
                  :loading="isRunningCommand"
                  :disabled="isRunningCommand"
                  @click="installDevice(item)"
                >
                  <q-tooltip>{{ $gettext('Install') }}</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useComputerStore } from 'src/stores/computer'
import { useDevicesStore } from 'src/stores/devices'
import { useExecutionsStore } from 'src/stores/executions'
import { useFiltersStore } from 'src/stores/filters'
import { useProgramStore } from 'src/stores/program'

const props = defineProps({
  name: { type: String, required: true },
  alternativeName: { type: String, required: true },
  id: { type: String, required: true },
  connection: { type: String, required: true },
  description: { type: String, required: false, default: '' },
  ip: { type: String, required: false, default: '' },
  logical: { type: Array, required: false, default: () => [] },
})

const computerStore = useComputerStore()
const devicesStore = useDevicesStore()
const executionsStore = useExecutionsStore()
const filtersStore = useFiltersStore()
const programStore = useProgramStore()

const { isRunningCommand } = storeToRefs(executionsStore)

const logical = computed(() => JSON.parse(JSON.stringify(props.logical)))

const visibleLogicalDevices = computed(() => {
  if (!filtersStore.onlyAssignedDevices) return logical.value

  return logical.value.filter((item) => isAssigned(item) || isInflicted(item))
})

const capabilityName = (item) => {
  return programStore.serverVersion.startsWith('4.')
    ? item.alternative_feature_name || item.feature.name
    : item.alternative_capability_name || item.capability.name
}

const isAssigned = (item) => {
  return item['x-type'] === 'assigned'
}

const isInflicted = (item) => {
  return item['x-type'] === 'inflicted'
}

const isAvailable = (item) => {
  return item['x-type'] === 'available'
}

const isPredetermined = (item) => {
  return item['x-is-default'] === true
}

const installDevice = (item) => {
  const attributes = programStore.serverVersion.startsWith('4.')
    ? [...item.attributes]
    : item.attributes.map((attr) => attr.id)

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
  let attributes = programStore.serverVersion.startsWith('4.')
    ? [...item.attributes]
    : item.attributes.map((attr) => attr.id)

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
</script>
