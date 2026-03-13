<template>
  <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
    <q-card unelevated class="glass-card device-card">
      <q-card-section horizontal class="q-pa-md items-center">
        <q-card-section class="col q-pa-none">
          <div class="text-overline text-grey-7 device-id-label ellipsis">
            {{ id }} {{ alternativeName ? `(${alternativeName})` : '' }}
          </div>
          <h3
            class="text-subtitle1 text-weight-bolder device-name ellipsis q-ma-none"
          >
            {{ name }}
            <q-tooltip>{{ name }}</q-tooltip>
          </h3>
          <div v-if="description" class="text-caption text-muted q-mt-xs">
            <q-icon name="mdi-map-marker" size="14px" /> {{ description }}
          </div>
        </q-card-section>

        <q-card-section class="col-auto q-pa-none">
          <div class="device-icon-wrapper flex flex-center">
            <q-icon
              :name="
                connection === 'TCP'
                  ? 'mdi-printer-pos-network'
                  : techIcon('printer')
              "
              size="40px"
              color="primary"
            >
              <q-tooltip>
                {{ connection }} <span v-if="ip">({{ ip }})</span>
              </q-tooltip>
              <div class="sr-only">
                {{
                  interpolate($gettext('Connection: %{type} %{ip}'), {
                    type: connection,
                    ip: ip ? `(${ip})` : '',
                  })
                }}
              </div>
            </q-icon>
          </div>
        </q-card-section>
      </q-card-section>

      <q-separator color="border" class="card-separator" />

      <q-card-section class="q-pa-none">
        <q-list separator class="logical-devices-list">
          <q-item
            v-for="item in visibleLogicalDevices"
            :key="item.id"
            dense
            class="q-py-sm"
          >
            <q-item-section avatar>
              <div class="logical-icon flex flex-center">
                <q-icon :name="appIcon('menu')" size="20px" color="grey-6" />
              </div>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{
                capabilityName(item)
              }}</q-item-label>
              <q-item-label
                v-if="isPredetermined(item)"
                caption
                class="text-info-dark flex items-center q-gutter-x-xs"
              >
                <q-icon :name="appIcon('star')" size="14px" />
                <span>{{ $gettext('Default') }}</span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center q-gutter-x-sm">
                <!-- Status Chips -->
                <Transition name="bounce">
                  <q-chip
                    v-if="isAssigned(item)"
                    color="positive"
                    :icon="appIcon('success')"
                    class="text-weight-bold"
                    outline
                    dense
                    size="12px"
                  >
                    {{ $gettext('Assigned') }}
                  </q-chip>
                </Transition>

                <q-chip
                  v-if="isInflicted(item)"
                  color="info"
                  :icon="appIcon('link')"
                  class="text-weight-bold"
                  dense
                  size="12px"
                >
                  {{ $gettext('Policy') }}
                </q-chip>

                <!-- Actions -->
                <div class="row q-gutter-x-xs">
                  <q-btn
                    v-if="isAssigned(item)"
                    flat
                    round
                    dense
                    color="negative"
                    :icon="appIcon('uninstall')"
                    class="action-hover"
                    :loading="isRunningCommand"
                    :disabled="isRunningCommand"
                    :aria-label="$gettext('Uninstall logical device')"
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
                    :icon="appIcon('install')"
                    class="action-hover"
                    :loading="isRunningCommand"
                    :disabled="isRunningCommand"
                    :aria-label="$gettext('Install logical device')"
                    @click="installDevice(item)"
                  >
                    <q-tooltip>{{ $gettext('Install') }}</q-tooltip>
                  </q-btn>
                </div>
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
import { useGettext } from 'vue3-gettext'

import { useComputerStore } from 'src/stores/computer'
import { useDevicesStore } from 'src/stores/devices'
import { useExecutionsStore } from 'src/stores/executions'
import { useFiltersStore } from 'src/stores/filters'
import { useCommand } from 'src/composables/useCommand'
import { appIcon, techIcon } from 'src/composables/element'

const props = defineProps({
  name: { type: String, required: true },
  alternativeName: { type: String, required: true },
  id: { type: String, required: true },
  connection: { type: String, required: true },
  description: { type: String, required: false, default: '' },
  ip: { type: String, required: false, default: '' },
  logical: { type: Array, required: false, default: () => [] },
})

const { $gettext, interpolate } = useGettext()

const computerStore = useComputerStore()
const devicesStore = useDevicesStore()
const executionsStore = useExecutionsStore()
const filtersStore = useFiltersStore()

const { isRunningCommand } = storeToRefs(executionsStore)
const { isLegacyServer } = useCommand()

const logical = computed(() => JSON.parse(JSON.stringify(props.logical)))

const visibleLogicalDevices = computed(() => {
  if (!filtersStore.onlyAssignedDevices) return logical.value

  return logical.value.filter((item) => isAssigned(item) || isInflicted(item))
})

const capabilityName = (item) => {
  return isLegacyServer.value
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
  const attributes = isLegacyServer.value
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
  let attributes = isLegacyServer.value
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

<style lang="scss" scoped>
.device-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-id-label {
  line-height: 1;
  margin-bottom: 2px;
}

.device-name {
  line-height: 1.2;
}

.device-icon-wrapper {
  width: 64px;
  height: 64px;
}

.logical-icon {
  width: 36px;
  height: 36px;
}

.text-info-dark {
  color: var(--q-info);
  font-weight: 500;
}

.body--dark {
  .device-icon-wrapper {
    background: rgba(255, 255, 255, 0.05);
  }
}

.card-separator {
  opacity: 0.5;
}
</style>
