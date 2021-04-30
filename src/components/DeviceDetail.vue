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

        <q-card-section class="col-3">
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
              @click="removeDevice($event, item)"
            >
              <q-tooltip>{{ $gettext('Uninstall') }}</q-tooltip>
            </q-btn>
          </template>

          <q-btn
            v-else
            color="positive"
            icon="mdi-download"
            class="float-right"
            @click="installDevice($event, item)"
          >
            <q-tooltip>{{ $gettext('Install') }}</q-tooltip>
          </q-btn>
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'DeviceDetail',
  props: {
    icon: { type: String, required: true },
    name: { type: String, required: true },
    id: { type: String, required: true },
    connection: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    ip: { type: String, required: false, default: '' },
    logical: { type: Array, required: false, default: () => [] }
  },
  computed: {
    tooltip() {
      if (this.ip) return `${this.connection} (${this.ip})`
      else return this.connection
    },

    visibleLogicalDevices() {
      if (!this.$store.state.filters.onlyAssignedDevices) return this.logical
      else
        return this.logical.filter((item) => {
          return this.isAssigned(item.id)
        })
    }
  },
  methods: {
    capabilityName(item) {
      return item.alternative_capability_name || item.capability.name
    },

    isAssigned(id) {
      return (
        this.$store.state.devices.assigned.find((item) => {
          return item.id === id
        }) ||
        this.$store.state.devices.inflicted.find((item) => {
          return item.id === id
        })
      )
    },

    installDevice(event, item) {
      let attributes = item.attributes.slice() // copy value (not reference)
      event.srcElement.parentElement.parentElement.parentElement.disabled = true

      if (!attributes.includes(this.$store.state.computer.attribute)) {
        attributes.push(this.$store.state.computer.attribute)
      }
      this.$store.dispatch('devices/changeDeviceAttributes', {
        id: item.id,
        attributes,
        element: event.srcElement.parentElement.parentElement.parentElement
      })
      this.$store.commit('devices/addAssignedDevice', {
        id: item.id,
        device: item.device,
        capability: item.capability
      })
    },

    removeDevice(event, item) {
      let attributes = item.attributes

      event.srcElement.parentElement.parentElement.parentElement.disabled = true
      attributes = attributes.filter((x) => {
        return x !== this.$store.state.computer.attribute
      })
      this.$store.dispatch('devices/changeDeviceAttributes', {
        id: item.id,
        attributes,
        element: event.srcElement.parentElement.parentElement.parentElement
      })
      this.$store.commit('devices/removeAssignedDevice', item.id)
    }
  }
}
</script>
