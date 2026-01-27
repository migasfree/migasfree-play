<template>
  <div class="q-pa-md">
    <!-- App Header & Identification -->
    <div class="row q-col-gutter-md q-mb-lg justify-center print-hide">
      <div class="col-12 text-center">
        <div class="row items-center justify-center q-gutter-x-md">
          <img width="64" src="img/migasfree-play.svg" class="pulse-hover" />
          <div class="text-left">
            <h4 class="q-my-none text-h5 text-weight-bold text-primary">
              {{ app.name }}
            </h4>
            <div class="text-subtitle2 text-grey-7">{{ app.version }}</div>
          </div>
        </div>
        <p
          class="text-caption text-grey-6 q-mt-sm q-mb-none max-width-600 q-mx-auto"
        >
          {{ app.description }}
        </p>
        <div class="text-center q-mt-lg text-caption text-grey-5 print-hide">
          {{ app.copyright }} • {{ app.author }}
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="row q-col-gutter-lg">
      <!-- Left Column: System & Hardware -->
      <div class="col-12 col-md-8 print-hide">
        <div class="row q-col-gutter-md">
          <!-- User & Sync -->
          <div class="col-12 col-sm-6">
            <q-card flat bordered class="info-card h-full">
              <q-card-section>
                <div
                  class="text-subtitle1 text-weight-bold row items-center q-mb-md text-primary"
                >
                  <q-icon name="mdi-sync" size="sm" class="q-mr-sm" />
                  {{ $gettext('Synchronization') }}
                </div>
                <q-list dense padding>
                  <InfoItem icon="mdi-account" :label="user" class="q-py-sm" />
                  <InfoItem icon="mdi-calendar-check" class="q-py-sm">
                    <DateView :value="syncEndDate" />
                  </InfoItem>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Connection -->
          <div class="col-12 col-sm-6">
            <q-card flat bordered class="info-card h-full">
              <q-card-section>
                <div
                  class="text-subtitle1 text-weight-bold row items-center q-mb-md text-primary"
                >
                  <q-icon name="mdi-server-network" size="sm" class="q-mr-sm" />
                  {{ $gettext('Migasfree Data') }}
                </div>
                <q-list dense padding>
                  <InfoItem
                    icon="mdi-server"
                    :label="`${host} (${serverVersion})`"
                    class="q-py-sm"
                  />
                  <InfoItem
                    icon="mdi-desktop-classic"
                    :label="client"
                    class="q-py-sm"
                  />
                  <InfoItem
                    icon="mdi-bank"
                    :label="organization"
                    :show="!!organization"
                    class="q-py-sm"
                  />
                  <InfoItem
                    icon="mdi-sitemap"
                    :label="project"
                    :show="!!project"
                    class="q-py-sm"
                  />
                  <InfoItem
                    icon="mdi-pound"
                    :label="computerId"
                    class="q-py-sm"
                  />
                  <InfoItem
                    :icon="statusIcon"
                    :label="statusText"
                    class="q-py-sm"
                  />
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Hardware -->
          <div v-if="'product' in data" class="col-12 col-sm-6">
            <q-card flat bordered class="info-card h-full">
              <q-card-section>
                <div
                  class="text-subtitle1 text-weight-bold row items-center q-mb-md text-primary"
                >
                  <q-icon name="mdi-chip" size="sm" class="q-mr-sm" />
                  {{ $gettext('Hardware') }}
                </div>
                <q-list dense padding>
                  <InfoItem
                    :icon="productIcon"
                    :label="data.product"
                    class="q-py-sm"
                  />
                  <InfoItem :icon="cpuIcon" :label="data.cpu" class="q-py-sm" />
                  <InfoItem
                    icon="mdi-memory"
                    :label="computerRam"
                    class="q-py-sm"
                  />
                  <InfoItem
                    icon="mdi-harddisk"
                    :label="computerStorage"
                    class="q-py-sm"
                  />
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Network -->
          <div v-if="'mac_address' in data" class="col-12 col-sm-6">
            <q-card flat bordered class="info-card h-full">
              <q-card-section>
                <div
                  class="text-subtitle1 text-weight-bold row items-center q-mb-md text-primary"
                >
                  <q-icon name="mdi-ethernet" size="sm" class="q-mr-sm" />
                  {{ $gettext('Network Data') }}
                </div>
                <q-list dense padding>
                  <InfoItem
                    icon="mdi-domain"
                    :label="data.fqdn || name"
                    class="q-py-sm"
                  />
                  <InfoItem
                    icon="mdi-ip-network"
                    :label="networkLabel"
                    class="q-py-sm"
                  />
                  <InfoItem
                    icon="mdi-swap-vertical"
                    :label="computerMac"
                    class="q-py-sm"
                  />
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Software Inventory (Full Width in Grid) -->
          <div v-if="inventory.length > 0" class="col-12">
            <q-card flat bordered class="info-card">
              <q-card-section class="q-pb-none">
                <div class="row items-center justify-between">
                  <div
                    class="text-subtitle1 text-weight-bold row items-center text-primary"
                  >
                    <q-icon
                      name="mdi-package-variant"
                      size="sm"
                      class="q-mr-sm"
                    />
                    {{ $gettext('Software Inventory') }}
                    <q-badge
                      color="primary"
                      transparent
                      align="top"
                      class="q-ml-sm text-weight-bold"
                    >
                      {{ inventory.length }}
                    </q-badge>
                  </div>

                  <div class="row q-gutter-x-sm items-center">
                    <q-input
                      v-model="search"
                      :placeholder="$gettext('Search...')"
                      dense
                      outlined
                      rounded
                      class="search-input"
                    >
                      <template #prepend>
                        <q-icon name="mdi-magnify" size="xs" />
                      </template>
                      <template v-if="search" #append>
                        <q-icon
                          name="mdi-close"
                          size="xs"
                          class="cursor-pointer"
                          @click="search = ''"
                        />
                      </template>
                    </q-input>
                    <CopyButton :text="inventoryText" round flat size="sm" />
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <div
                  class="inventory-container bg-grey-1 rounded-borders q-pa-sm"
                >
                  <q-virtual-scroll
                    class="inventory-list"
                    :items-size="filteredInventory.length"
                    :items="filteredInventory"
                    style="height: 250px"
                  >
                    <template #default="{ item }">
                      <q-item dense class="inventory-item">
                        <q-item-section>
                          <q-item-label class="text-body2">{{
                            item
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-virtual-scroll>
                  <div
                    v-if="filteredInventory.length === 0"
                    class="text-center text-grey-6 q-py-md"
                  >
                    {{ $gettext('No results found') }}
                  </div>
                </div>
                <div
                  v-if="search"
                  class="text-right text-caption text-grey-6 q-mt-sm"
                >
                  {{ filteredInventory.length }} {{ $gettext('results') }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Right Column: Identity -->
      <div class="col-12 col-md-4">
        <div class="sticky-top">
          <q-card flat bordered class="info-card print-card">
            <q-card-section class="text-center">
              <div class="q-pa-md q-mb-md">
                <qrcode-vue :value="qrCode" :size="140" level="L" />
              </div>

              <div class="text-h6 text-weight-bold q-mb-xs text-primary">
                {{ name }}
              </div>
              <div class="text-subtitle2 text-grey-8">{{ computerId }}</div>

              <q-separator class="q-my-md" />

              <div class="text-body2 text-grey-8 q-mb-xs">{{ uuid }}</div>
              <div class="text-body2 text-grey-8 q-mb-xs">{{ host }}</div>
              <div class="text-body2 text-grey-8">{{ helpdesk }}</div>

              <div class="q-mt-lg print-hide">
                <q-btn
                  outline
                  color="primary"
                  :label="$gettext('Print Label')"
                  icon="mdi-printer"
                  class="full-width"
                  @click="printLabel"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div class="print-container hidden-print">
      <div class="print-card-content">
        <div class="text-center">
          <div class="q-pa-md q-mb-md">
            <qrcode-vue :value="qrCode" :size="200" level="L" render-as="svg" />
          </div>

          <div class="text-h5 text-weight-bold q-mb-sm text-black">
            {{ name }}
          </div>
          <div class="text-h6 text-grey-9 q-mb-md">{{ computerId }}</div>

          <hr class="print-separator" />

          <div class="text-body1 text-black q-mb-xs">{{ uuid }}</div>
          <div class="text-body1 text-black q-mb-xs">{{ host }}</div>
          <div class="text-body1 text-black">{{ helpdesk }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'

import QrcodeVue from 'qrcode.vue'
import CopyButton from 'components/CopyButton'
import DateView from 'components/DateView'
import InfoItem from 'components/InfoItem'

import { useComputerStore } from 'src/stores/computer'
import { usePackagesStore } from 'src/stores/packages'
import { useProgramStore } from 'src/stores/program'

import app from '../../package.json'

const { $gettext } = useGettext()

const computerStore = useComputerStore()
const packagesStore = usePackagesStore()
const programStore = useProgramStore()

const search = ref('')

const { cid, data, user, mask, network, project, name, uuid, helpdesk, ip } =
  storeToRefs(computerStore)
const { inventory } = storeToRefs(packagesStore)

const host = programStore.host
const serverVersion = programStore.serverVersion
const organization = programStore.organization
const client = programStore.clientVersion

const bytesToGigas = (value) => {
  return (value / 1024 / 1024 / 1024).toFixed(1)
}

const filteredInventory = computed(() => {
  const query = (search.value ?? '').toLowerCase()

  if (!query) return inventory.value

  return inventory.value.filter((item) => item.toLowerCase().includes(query))
})

const syncEndDate = computed(() =>
  'sync_end_date' in data.value ? data.value.sync_end_date : '',
)

const computerRam = computed(() =>
  'ram' in data.value ? `${bytesToGigas(data.value.ram)} GB RAM` : '',
)

const computerStorage = computed(() => {
  const { storage, disks } = data.value

  return storage
    ? `${bytesToGigas(storage)} GB (${disks} ${$gettext('disks')})`
    : ''
})

const computerMac = computed(() => {
  if (!data.value.mac_address) return ''

  return data.value.mac_address
    .match(/.{1,12}/g)
    .map((chunk) => chunk.replace(/(.{2})/g, '$1:').slice(0, -1))
    .join(', ')
})

const networkLabel = computed(() => {
  const ipAddr = ip.value || data.value.ip_address || ''
  const m = mask.value || ''
  const n = network.value || ''

  let label = ipAddr
  if (m) label += ` / ${m}`
  if (n) label += ` (${n})`

  return label
})

const computerId = computed(() => `CID-${cid.value ?? '?'}`)

const productIcon = computed(() => {
  const icons = {
    desktop: 'mdi-desktop-tower-monitor',
    laptop: 'mdi-laptop',
    virtual: 'mdi-cube-outline',
    docker: 'mdi-docker',
  }

  return icons[data.value.product_system] ?? icons['desktop']
})

const cpuIcon = computed(() => {
  const arch = data.value.architecture

  return [32, 64].includes(arch) ? `mdi-cpu-${arch}-bit` : 'mdi-cpu-64-bit'
})

const statusIcon = computed(() => {
  const iconMap = {
    available: 'mdi-cart',
    'in repair': 'mdi-wrench',
    reserved: 'mdi-lock-alert',
    intended: 'mdi-heart-pulse',
    unsubscribed: 'mdi-recycle-variant',
  }

  return iconMap[data.value.status] ?? 'mdi-crosshairs-question'
})

const statusText = computed(() => {
  const map = {
    available: $gettext('Available'),
    'in repair': $gettext('In repair'),
    reserved: $gettext('Reserved'),
    intended: $gettext('Intended'),
    unsubscribed: $gettext('Unsubscribed'),
  }

  return map[data.value.status] ?? $gettext('Unknown')
})

const qrCode = computed(() =>
  JSON.stringify({
    model: 'computer',
    id: cid.value,
    server: programStore.host,
  }),
)

const printLabel = () => {
  window.print()
}

const sortArray = (array) => {
  return [...array].sort((a, b) => a - b)
}

const inventoryText = computed(() => {
  return sortArray(filteredInventory.value).join('\n')
})
</script>

<style scoped>
.max-width-600 {
  max-width: 600px;
}

.info-card {
  transition: all 0.3s ease;
  height: 100%;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.h-full {
  height: 100%;
}

.search-input {
  width: 200px;
}

.sticky-top {
  position: sticky;
  top: 24px;
}

.pulse-hover {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pulse-hover:hover {
  transform: scale(1.1);
}

.inventory-item {
  border-radius: 4px;
}

.inventory-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

/* Dark Mode Adjustments */
.body--dark .info-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .info-card:hover {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.body--dark .inventory-container {
  background: rgba(255, 255, 255, 0.05) !important;
}

.body--dark .text-grey-7,
.body--dark .text-grey-6,
.body--dark .text-grey-8 {
  color: #bbb !important;
}

/* Default state: hidden */
.hidden-print {
  display: none;
}

/* Print Styles */
@media print {
  /* Hide the entire app */
  :global(body > #q-app) {
    display: none !important;
  }

  /* Show only our print container */
  .hidden-print {
    display: flex !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 99999;
    justify-content: center;
    align-items: center;
  }

  .print-card-content {
    border: 2px solid #000;
    padding: 40px;
    border-radius: 12px;
    width: 80%;
    max-width: 500px;
  }

  .print-separator {
    border: 0;
    border-top: 1px solid #000;
    margin: 20px 0;
  }
}
</style>
