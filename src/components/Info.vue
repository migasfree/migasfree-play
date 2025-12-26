<template>
  <div class="print-hide q-my-lg">
    <div class="column items-center">
      <p>
        <img width="120" src="img/migasfree-play.svg" />
      </p>

      <p class="text-h5">
        <strong>{{ app.name }} {{ app.version }}</strong>
      </p>

      <p class="text-caption text-center">
        {{ app.description }} <br />{{ app.copyright }} <br />{{ app.author }}
      </p>

      <q-card v-if="user" flat bordered class="half q-ma-md">
        <InfoItem icon="mdi-account" :label="user" />
        <InfoItem icon="mdi-calendar-check">
          <DateView :value="syncEndDate" />
        </InfoItem>

        <q-tooltip anchor="top middle">{{
          $gettext('Last synchronization')
        }}</q-tooltip>
      </q-card>

      <q-card v-if="'product' in data" flat bordered class="half q-ma-md">
        <InfoItem :icon="productIcon" :label="data.product" />
        <InfoItem :icon="cpuIcon" :label="data.cpu" />
        <InfoItem icon="mdi-memory" :label="computerRam" />
        <InfoItem icon="mdi-harddisk" :label="computerStorage" />

        <q-tooltip>{{ $gettext('Hardware') }}</q-tooltip>
      </q-card>

      <q-card v-if="'mac_address' in data" flat bordered class="half q-ma-md">
        <InfoItem icon="mdi-information" :label="data.fqdn" />
        <InfoItem
          icon="mdi-ip-network"
          :label="`${data.ip_address} / ${mask} (${network})`"
        />
        <InfoItem icon="mdi-swap-vertical" :label="computerMac" />

        <q-tooltip>{{ $gettext('Network Data') }}</q-tooltip>
      </q-card>

      <q-card flat bordered class="half q-ma-md">
        <InfoItem icon="mdi-server" :label="`${host} (${serverVersion})`" />
        <InfoItem icon="mdi-desktop-classic" :label="client" />
        <InfoItem
          icon="mdi-bank"
          :label="organization"
          :show="!!organization"
        />
        <InfoItem icon="mdi-sitemap" :label="project" />
        <InfoItem icon="mdi-pound" :label="computerId" />
        <InfoItem :icon="statusIcon" :label="statusText" />

        <q-tooltip>{{ $gettext('Migasfree Data') }}</q-tooltip>
      </q-card>
    </div>

    <div v-if="inventory.length > 0" class="row q-ma-md q-mb-lg">
      <div class="col-10 offset-1">
        <q-list
          bordered
          :class="[
            'q-card q-card--flat no-shadow',
            $q.dark.isActive ? 'q-card--dark q-dark' : '',
          ]"
        >
          <q-expansion-item v-model="expanded" :content-inset-level="0.5">
            <template #header>
              <q-item-section avatar>
                <q-icon name="mdi-package-variant" size="md" />
              </q-item-section>

              <q-item-section>
                <strong>{{
                  $gettext('%{num} packages', {
                    num: inventory.length,
                  })
                }}</strong>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-x-sm">
                  <q-btn
                    v-if="!showSearch"
                    flat
                    icon="mdi-magnify"
                    color="primary"
                    @click.stop="toggleSearch"
                    ><q-tooltip>{{ $gettext('Search') }}</q-tooltip></q-btn
                  >

                  <q-input
                    v-if="showSearch"
                    ref="searchInput"
                    v-model="search"
                    :label="$gettext('Search')"
                    clearable
                    dense
                    @clear="showSearch = false"
                    @click.stop
                    ><template #prepend><q-icon name="mdi-magnify" /></template
                  ></q-input>

                  <q-btn
                    flat
                    icon="mdi-content-copy"
                    color="primary"
                    @click.stop="copyInventory"
                    ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
                  >
                </div>
              </q-item-section>
            </template>

            <q-list>
              <q-virtual-scroll
                class="overflow"
                :items-size="filteredInventory.length"
                :items="filteredInventory"
              >
                <template #default="{ item }">
                  <q-item dense>
                    {{ item }}
                  </q-item>
                </template>
              </q-virtual-scroll>
            </q-list>
          </q-expansion-item>

          <q-tooltip>{{ $gettext('Software Inventory') }}</q-tooltip>
        </q-list>

        <p v-if="search" class="text-caption text-right text-blue-grey q-mt-sm">
          {{ filteredInventory.length }}
        </p>
      </div>
    </div>
  </div>

  <div class="column items-center">
    <q-card flat bordered class="identification">
      <q-card-section horizontal>
        <vue-qrcode
          :value="qrCode"
          :options="{ width: 140, errorCorrectionLevel: 'low' }"
        />

        <q-card-section vertical class="justify-around q-px-md">
          <p class="q-mb-sm">{{ name }} ({{ computerId }})</p>
          <div class="text-caption text-blue-grey">
            <p class="q-mb-sm">{{ uuid }}</p>
            <p class="q-mb-sm">{{ host }}</p>
            <p class="q-mb-none">{{ helpdesk }}</p>
          </div>
        </q-card-section>
      </q-card-section>

      <q-separator inset />

      <q-card-actions align="center" class="print-hide">
        <q-btn
          :color="$q.dark.isActive ? 'indigo' : 'positive'"
          icon="mdi-printer"
          class="q-mx-lg"
          @click="printLabel"
        >
          <q-tooltip class="print-hide">{{
            $gettext('Print Identification')
          }}</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { copyToClipboard } from 'quasar'

import VueQrcode from '@chenfengyuan/vue-qrcode'
import DateView from 'components/DateView'
import InfoItem from 'components/InfoItem'

import { useComputerStore } from 'src/stores/computer'
import { usePackagesStore } from 'src/stores/packages'
import { useProgramStore } from 'src/stores/program'
import { useUiStore } from 'src/stores/ui'

const app = require('../../package.json')

const { $gettext } = useGettext()

const computerStore = useComputerStore()
const packagesStore = usePackagesStore()
const programStore = useProgramStore()
const uiStore = useUiStore()

const search = ref('')
const showSearch = ref(false)
const expanded = ref(false)
const searchInput = useTemplateRef('searchInput')

const { cid, data, user, mask, network, project, name, uuid, helpdesk } =
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

const computerId = computed(() => `CID-${cid.value ?? '?'}`)

const productIcon = computed(() => {
  const icons = {
    desktop: 'mdi-desktop-tower-monitor',
    laptop: 'mdi-laptop',
    virtual: 'mdi-cube-outline',
    docker: 'mdi-docker',
  }

  return icons[data.value.product_system] ?? 'mdi-help'
})

const cpuIcon = computed(() => {
  const arch = data.value.architecture

  return [32, 64].includes(arch) ? `mdi-cpu-${arch}-bit` : 'mdi-help'
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

watch(
  () => search.value,
  () => {
    expanded.value = !!search.value
  },
)

const toggleSearch = async () => {
  showSearch.value = !showSearch.value
  expanded.value = showSearch.value
  if (showSearch.value) {
    await nextTick()
    if (searchInput.value) {
      searchInput.value.focus()
    }
  }
}

const printLabel = () => {
  window.print()
}

const sortArray = (array) => {
  return [...array].sort((a, b) => a - b)
}

const copyInventory = async () => {
  copyToClipboard(sortArray(filteredInventory.value).join('\n')).then(() => {
    uiStore.notifySuccess($gettext('Text copied to clipboard'))
  })
}
</script>

<style scoped>
.half {
  width: 100%;
  max-width: 400px;
}

.identification {
  width: 100%;
  max-width: 600px;
}
</style>
