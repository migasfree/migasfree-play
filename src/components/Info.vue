<template>
  <div class="info-page-container">
    <!-- App Header & Identification -->
    <div class="row q-col-gutter-md q-mb-xl justify-center print-hide">
      <div class="col-12 text-center">
        <div class="row items-center justify-center q-gutter-x-lg">
          <img
            width="80"
            src="img/migasfree-play.svg"
            class="app-logo-img"
            :alt="$gettext('migasfree logo')"
          />
          <div class="text-left">
            <h1 class="text-h4 text-weight-bolder q-my-none">
              {{ app.name }}
            </h1>
            <div class="text-subtitle2 text-muted q-mt-xs">
              {{ app.version }}
            </div>
          </div>
        </div>
        <p
          class="text-body1 text-muted q-mt-lg q-mb-none max-width-600 q-mx-auto line-height-1-6"
        >
          {{ app.description }}
        </p>
        <div class="text-center q-mt-md text-caption text-muted print-hide">
          {{ app.copyright }} • {{ app.author }}
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="row q-col-gutter-md">
      <!-- Left Column: System & Hardware -->
      <div class="col-12 col-md-8 print-hide">
        <div class="row q-col-gutter-md">
          <!-- User & Sync -->
          <div class="col-12 col-sm-6">
            <q-card unelevated class="glass-card card-stretch">
              <q-card-section class="q-pa-md">
                <h2 class="text-overline text-primary q-mb-sm section-header">
                  <q-icon :name="appIcon('sync')" size="14px" class="q-mr-xs" />
                  {{ $gettext('Synchronization') }}
                </h2>
                <q-list dense>
                  <InfoItem
                    :icon="appIcon('user')"
                    :label="user"
                    class="q-py-xs"
                  />
                  <InfoItem :icon="appIcon('clock')" class="q-py-xs">
                    <DateView :value="syncEndDate" />
                  </InfoItem>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Connection -->
          <div class="col-12 col-sm-6">
            <q-card unelevated class="glass-card card-stretch">
              <q-card-section class="q-pa-md">
                <h2 class="text-overline text-primary q-mb-sm section-header">
                  <q-icon
                    :name="techIcon('network')"
                    size="14px"
                    class="q-mr-xs"
                  />
                  {{ $gettext('Migasfree Data') }}
                </h2>
                <q-list dense>
                  <InfoItem
                    :icon="appIcon('server')"
                    :label="`${host} (${serverVersion})`"
                    class="q-py-xs"
                  />
                  <InfoItem
                    :icon="techIcon('computer')"
                    :label="client"
                    class="q-py-xs"
                  />
                  <InfoItem
                    :icon="appIcon('organization')"
                    :label="organization"
                    :show="!!organization"
                    class="q-py-xs"
                  />
                  <InfoItem
                    :icon="modelIcon('projects')"
                    :label="project"
                    :show="!!project"
                    class="q-py-xs"
                  />
                  <InfoItem
                    :icon="appIcon('cid')"
                    :label="computerId"
                    class="q-py-xs"
                  >
                    <template v-if="!isRegistered" #append>
                      <q-icon
                        :name="appIcon('warning')"
                        color="warning"
                        size="xs"
                        class="q-ml-sm cursor-pointer"
                      >
                        <q-tooltip>
                          {{ $gettext('Computer not registered') }}
                        </q-tooltip>
                      </q-icon>
                    </template>
                  </InfoItem>
                  <InfoItem
                    :icon="statusIcon"
                    :label="statusText"
                    class="q-py-xs"
                  />
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Hardware -->
          <div v-if="'product' in data" class="col-12 col-sm-6">
            <q-card unelevated class="glass-card card-stretch">
              <q-card-section class="q-pa-md">
                <h2 class="text-overline text-primary q-mb-sm section-header">
                  <q-icon :name="techIcon('cpu')" size="14px" class="q-mr-xs" />
                  {{ $gettext('Hardware') }}
                </h2>
                <q-list dense>
                  <InfoItem
                    :icon="productIcon"
                    :label="data.product"
                    class="q-py-xs"
                  />
                  <InfoItem :icon="cpuIcon" :label="data.cpu" class="q-py-xs" />
                  <InfoItem
                    :icon="techIcon('ram')"
                    :label="computerRam"
                    class="q-py-xs"
                  />
                  <InfoItem
                    :icon="techIcon('disk')"
                    :label="computerStorage"
                    class="q-py-xs"
                  />
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Network -->
          <div v-if="'mac_address' in data" class="col-12 col-sm-6">
            <q-card unelevated class="glass-card card-stretch">
              <q-card-section class="q-pa-md">
                <h2 class="text-overline text-primary q-mb-sm section-header">
                  <q-icon
                    :name="techIcon('network')"
                    size="14px"
                    class="q-mr-xs"
                  />
                  {{ $gettext('Network Data') }}
                </h2>
                <q-list dense>
                  <InfoItem
                    :icon="appIcon('domain')"
                    :label="data.fqdn || name"
                    class="q-py-xs"
                  />
                  <InfoItem
                    :icon="techIcon('ip')"
                    :label="networkLabel"
                    class="q-py-xs"
                  />
                  <InfoItem
                    :icon="techIcon('mac')"
                    :label="computerMac"
                    class="q-py-xs"
                  />
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Software Inventory (Full Width in Grid) -->
          <div v-if="inventory.length > 0" class="col-12">
            <q-card unelevated class="glass-card">
              <q-card-section class="q-pa-md">
                <div class="row items-center justify-between q-mb-md">
                  <h2
                    class="text-overline text-primary section-header q-ma-none"
                  >
                    <q-icon
                      :name="appIcon('software')"
                      size="14px"
                      class="q-mr-xs"
                    />
                    {{ $gettext('Software Inventory') }}
                    <q-badge
                      color="primary"
                      transparent
                      align="top"
                      class="q-ml-sm text-weight-bold"
                    >
                      <template v-if="search">
                        {{ filteredInventory.length }} / {{ inventory.length }}
                      </template>
                      <template v-else>
                        {{ inventory.length }}
                      </template>
                    </q-badge>
                  </h2>

                  <div class="row q-gutter-x-sm items-center">
                    <q-input
                      v-model="search"
                      :placeholder="$gettext('Search...')"
                      dense
                      filled
                      class="search-input"
                      :aria-label="$gettext('Search software inventory')"
                    >
                      <template #prepend>
                        <q-icon :name="appIcon('search')" size="xs" />
                      </template>
                      <template v-if="search" #append>
                        <q-icon
                          :name="appIcon('close')"
                          size="xs"
                          class="cursor-pointer"
                          @click="search = ''"
                        />
                      </template>
                    </q-input>
                    <CopyButton
                      :text="inventoryText"
                      flat
                      size="sm"
                      class="action-btn"
                    />
                  </div>
                </div>

                <div class="inventory-container rounded-borders q-pa-sm">
                  <q-virtual-scroll
                    class="inventory-list"
                    :items-size="filteredInventory.length"
                    :items="filteredInventory"
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
                    class="text-center text-muted q-py-lg"
                  >
                    <q-icon
                      :name="appIcon('search_off')"
                      size="md"
                      class="q-mb-sm opacity-40"
                    />
                    <div>{{ $gettext('No results found') }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Right Column: Identity Label -->
      <div class="col-12 col-md-4">
        <div class="sticky-top">
          <div class="label-container flex flex-center">
            <!-- The Actual Label (80x50mm optimized) -->
            <div id="printable-label" class="physical-label shadow-10">
              <header
                class="label-header row no-wrap items-center justify-between q-px-md q-py-sm"
              >
                <div class="row no-wrap items-center">
                  <div class="label-logo-bg q-mr-sm flex flex-center">
                    <img
                      alt="Migasfree logo"
                      src="img/migasfree-play.svg"
                      class="label-logo"
                    />
                  </div>
                  <div class="column">
                    <div
                      class="text-subtitle2 text-weight-bolder text-primary line-height-1"
                    >
                      migasfree
                    </div>
                    <div
                      class="label-subtitle uppercase letter-spacing-1 text-weight-bold text-grey-7"
                    >
                      {{ $gettext('Identification') }}
                    </div>
                  </div>
                </div>
                <div class="qr-label-container flex flex-center q-pa-xs">
                  <qrcode-vue :value="qrCode" :size="72" level="L" />
                </div>
              </header>

              <q-separator class="label-divider" />

              <section class="label-body q-px-md q-py-md">
                <div class="row items-baseline no-wrap q-mb-md">
                  <div
                    class="text-h6 text-weight-bolder ellipsis q-mr-sm line-height-1"
                  >
                    {{ name }}
                  </div>
                  <div class="text-overline text-grey-7 text-no-wrap">
                    {{ computerId }}
                  </div>
                </div>

                <div class="q-mb-md">
                  <div class="label-overline-small text-grey-6">
                    {{ $gettext('UUID') }}
                  </div>
                  <div class="label-uuid text-weight-bold text-mono">
                    {{ uuid }}
                  </div>
                </div>

                <div class="row no-wrap items-center">
                  <q-icon
                    :name="techIcon('network')"
                    size="14px"
                    color="primary"
                    class="q-mr-sm"
                  />
                  <div class="label-server text-weight-bold text-grey-8">
                    {{ host }}
                  </div>
                </div>
              </section>

              <footer class="label-footer q-px-md q-py-sm text-center">
                <div class="label-helpdesk text-weight-bolder text-primary">
                  {{ helpdesk }}
                </div>
              </footer>
            </div>
          </div>

          <!-- Hint & Print Button -->
          <div class="text-center q-mt-lg print-hide">
            <q-btn
              unelevated
              color="primary"
              :label="$gettext('Print Label')"
              :icon="techIcon('printer')"
              class="q-mb-md action-btn"
              @click="printLabel"
            />
            <div class="opacity-60 flex flex-center">
              <q-icon
                :name="appIcon('info_outline')"
                size="14px"
                class="q-mr-xs"
              />
              <span class="text-caption">
                {{
                  $gettext('Label size optimized for 80x50mm thermal printers.')
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div class="print-container hidden-print">
      <div class="print-card-content">
        <div class="row no-wrap items-center justify-between q-px-md q-py-sm">
          <div class="row no-wrap items-center">
            <img
              alt="Migasfree logo"
              src="img/migasfree-play.svg"
              class="q-mr-sm"
              width="36"
              height="36"
            />
            <div class="column">
              <div class="text-subtitle2 text-weight-bolder text-black">
                migasfree
              </div>
              <div
                class="label-subtitle uppercase letter-spacing-1 text-weight-bold text-grey-7"
              >
                {{ $gettext('Identification') }}
              </div>
            </div>
          </div>
          <qrcode-vue :value="qrCode" :size="100" level="L" render-as="svg" />
        </div>

        <hr class="print-separator" />

        <div class="q-px-md q-py-sm">
          <div class="row items-baseline no-wrap q-mb-xs">
            <span class="text-subtitle1 text-weight-bolder text-black q-mr-sm">
              {{ name }}
            </span>
            <span class="text-caption text-grey-8">{{ computerId }}</span>
          </div>

          <div class="q-mb-xs">
            <div class="label-overline text-grey-8">{{ $gettext('UUID') }}</div>
            <div class="label-uuid text-weight-bold text-black">
              {{ uuid }}
            </div>
          </div>

          <div class="row no-wrap items-center">
            <span class="label-server text-weight-medium text-grey-9">
              {{ host }}
            </span>
          </div>
        </div>

        <hr class="print-separator" />

        <div class="text-center q-py-xs q-px-md">
          <span class="label-helpdesk text-weight-bold text-black">
            {{ helpdesk }}
          </span>
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
import {
  appIcon,
  techIcon,
  elementIcon,
  productIcon as getProductIcon,
  cpuIcon as getCpuIcon,
  modelIcon,
  useElement,
} from 'src/composables/element'

import app from '../../package.json'

const { $gettext } = useGettext()

const { computerStatus } = useElement()
const computerStore = useComputerStore()
const packagesStore = usePackagesStore()
const programStore = useProgramStore()

const search = ref('')

const {
  cid,
  data,
  user,
  mask,
  network,
  project,
  name,
  uuid,
  helpdesk,
  ip,
  isRegistered,
} = storeToRefs(computerStore)
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

const productIcon = computed(() => getProductIcon(data.value.product_system))

const cpuIcon = computed(() => getCpuIcon(data.value.architecture))

const statusIcon = computed(() => elementIcon(data.value.status))

const statusText = computed(() => computerStatus(data.value.status))

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

<style lang="scss" scoped>
/* Text Utilities */
.max-width-600 {
  max-width: 600px;
}

.line-height-1-6 {
  line-height: 1.6;
}

.line-height-1 {
  line-height: 1;
}

.letter-spacing-1 {
  letter-spacing: 1.5px;
}

.uppercase {
  text-transform: uppercase;
}

.section-header {
  display: flex;
  align-items: center;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.card-stretch {
  height: 100%;
}

.app-logo-img {
  width: 80px;
  height: auto;
}

.inventory-container {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.inventory-list {
  height: 300px;
}

.inventory-item {
  border-radius: 4px;
  transition: background 0.2s ease;
  &:hover {
    background: rgba(var(--brand-primary-rgb), 0.08);
  }
}

.search-input {
  width: 240px;
  :deep(.q-field__control) {
    border-radius: 8px;
  }
}

.sticky-top {
  position: sticky;
  top: 24px;
}

.action-btn {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }
}

/* === Physical Label (80x50mm optimized) === */
.physical-label {
  width: 320px;
  background: white;
  color: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  font-family: var(--font-ui);
}

.label-logo-bg {
  width: 48px;
  height: 48px;
  padding: 8px;
}

.label-logo {
  width: 100%;
  height: auto;
}

.qr-label-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.label-divider {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  background: none;
}

.label-subtitle {
  font-size: 8px;
  line-height: 1;
}

.label-overline-small {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1;
  margin-bottom: 2px;
}

.label-uuid {
  font-size: 11px;
  line-height: 1.3;
  word-break: break-all;
}

.label-server,
.label-helpdesk {
  font-size: 13px;
}

.label-footer {
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
}

/* Dark Mode Adjustments */
.body--dark {
  .inventory-container {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .physical-label {
    background: #1e1e1e;
    color: #e0e0e0;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  }

  .label-divider {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .label-footer {
    background: rgba(0, 0, 0, 0.2);
    border-top-color: rgba(255, 255, 255, 0.05);
  }
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
    padding: 20px;
    border-radius: 12px;
    width: 320px;
  }

  .print-separator {
    border: 0;
    border-top: 1px dashed #ccc;
    margin: 12px 0;
  }
}
</style>
