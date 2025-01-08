<template>
  <div class="print-hide">
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
        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-account" />
          </q-item-section>

          <q-item-section class="text-h6">{{ user }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-calendar-check" />
          </q-item-section>

          <q-item-section class="text-h6"
            ><DateView :value="syncEndDate"
          /></q-item-section>
        </q-item>

        <q-tooltip anchor="top middle">{{
          $gettext('Last synchronization')
        }}</q-tooltip>
      </q-card>

      <q-card v-if="'product' in data" flat bordered class="half q-ma-md">
        <q-item>
          <q-item-section avatar>
            <q-icon :name="productIcon" />
          </q-item-section>

          <q-item-section class="text-h6">{{ data.product }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon :name="cpuIcon" />
          </q-item-section>

          <q-item-section class="text-h6">{{ data.cpu }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-memory" />
          </q-item-section>

          <q-item-section class="text-h6">{{ computerRam }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-harddisk" />
          </q-item-section>

          <q-item-section class="text-h6">{{ computerStorage }}</q-item-section>
        </q-item>

        <q-tooltip>{{ $gettext('Hardware') }}</q-tooltip>
      </q-card>

      <q-card v-if="'mac_address' in data" flat bordered class="half q-ma-md">
        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-information" />
          </q-item-section>

          <q-item-section class="text-h6">{{ data.fqdn }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-ip-network" />
          </q-item-section>

          <q-item-section class="text-h6"
            >{{ data.ip_address }} / {{ mask }} ({{ network }})</q-item-section
          >
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-swap-vertical" />
          </q-item-section>

          <q-item-section class="text-h6">{{ computerMac }}</q-item-section>
        </q-item>

        <q-tooltip>{{ $gettext('Network Data') }}</q-tooltip>
      </q-card>

      <q-card flat bordered class="half q-ma-md">
        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-server" />
          </q-item-section>

          <q-item-section class="text-h6"
            >{{ host }} ({{ serverVersion }})</q-item-section
          >
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-desktop-classic" />
          </q-item-section>

          <q-item-section class="text-h6">{{ client }}</q-item-section>
        </q-item>

        <q-item v-if="organization">
          <q-item-section avatar>
            <q-icon name="mdi-bank" />
          </q-item-section>

          <q-item-section class="text-h6">{{ organization }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-sitemap" />
          </q-item-section>

          <q-item-section class="text-h6">{{ project }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-pound" />
          </q-item-section>

          <q-item-section class="text-h6">{{ computerId }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon :name="statusIcon" />
          </q-item-section>

          <q-item-section class="text-h6">{{ statusText }}</q-item-section>
        </q-item>

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
                    @click.stop="
                      ((showSearch = !showSearch), (expanded = showSearch))
                    "
                    ><q-tooltip>{{ $gettext('Search') }}</q-tooltip></q-btn
                  >

                  <q-input
                    v-if="showSearch"
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

<script>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { copyToClipboard } from 'quasar'

import VueQrcode from '@chenfengyuan/vue-qrcode'
import DateView from 'components/DateView'

import { useComputerStore } from 'src/stores/computer'
import { usePackagesStore } from 'src/stores/packages'
import { useProgramStore } from 'src/stores/program'
import { useUiStore } from 'src/stores/ui'

const app = require('../../package.json')

export default {
  name: 'Info',
  components: {
    DateView,
    VueQrcode,
  },
  setup() {
    const { $gettext } = useGettext()

    const computerStore = useComputerStore()
    const packagesStore = usePackagesStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const search = ref('')
    const showSearch = ref(false)
    const expanded = ref(false)

    const { cid, data, user, mask, network, project, name, uuid, helpdesk } =
      storeToRefs(computerStore)
    const { inventory } = storeToRefs(packagesStore)

    const filteredInventory = computed(() => {
      if (search.value === '' || search.value === null) {
        return inventory.value
      } else {
        return inventory.value.filter((item) => {
          return item.toLowerCase().includes(search.value.toLowerCase())
        })
      }
    })

    const syncEndDate = computed(() =>
      'sync_end_date' in data.value ? data.value.sync_end_date : '',
    )

    const computerRam = computed(() =>
      'ram' in data.value ? `${bytesToGigas(data.value.ram)} GB RAM` : '',
    )

    const computerStorage = computed(() =>
      'storage' in data.value
        ? `${bytesToGigas(data.value.storage)} GB (${
            data.value.disks
          } ${$gettext('disks')})`
        : '',
    )

    const computerMac = computed(() => {
      const ret = []

      if (data.value.mac_address) {
        let tmp = ''
        for (let i = 0; i < data.value.mac_address.length; i += 12) {
          tmp = data.value.mac_address.substring(i, i + 12)
          ret.push(tmp.replace(/(.{2})/g, '$1:').slice(0, -1))
        }
      }

      return ret.join(', ')
    })

    const computerId = computed(() =>
      cid.value ? `CID-${cid.value}` : 'CID-?',
    )

    const productIcon = computed(() => {
      switch (data.value.product_system) {
        case 'desktop':
          return 'mdi-desktop-tower-monitor'
        case 'laptop':
          return 'mdi-laptop'
        case 'virtual':
          return 'mdi-cube-outline'
        case 'docker':
          return 'mdi-docker'
        default:
          return 'mdi-help'
      }
    })

    const cpuIcon = computed(() => {
      switch (data.value.architecture) {
        case 32:
        case 64:
          return `mdi-cpu-${data.value.architecture}-bit`
        default:
          return 'mdi-help'
      }
    })

    const statusIcon = computed(() => {
      switch (data.value.status) {
        case 'available':
          return 'mdi-cart'
        case 'in repair':
          return 'mdi-wrench'
        case 'reserved':
          return 'mdi-lock-alert'
        case 'intended':
          return 'mdi-heart-pulse'
        case 'unsubscribed':
          return 'mdi-recycle-variant'
        default:
          return 'mdi-crosshairs-question'
      }
    })

    const statusText = computed(() => {
      switch (data.value.status) {
        case 'available':
          return $gettext('Available')
        case 'in repair':
          return $gettext('In repair')
        case 'reserved':
          return $gettext('Reserved')
        case 'intended':
          return $gettext('Intended')
        case 'unsubscribed':
          return $gettext('Unsubscribed')
        default:
          return $gettext('Unknown')
      }
    })

    const qrCode = computed(() => {
      let info = {
        model: 'computer',
        id: cid.value,
        server: programStore.host,
      }

      return JSON.stringify(info)
    })

    watch(
      () => search.value,
      () => {
        expanded.value = !!search.value
      },
    )

    const bytesToGigas = (value) => {
      return (value / 1024 / 1024 / 1024).toFixed(1)
    }

    const printLabel = () => {
      window.print()
    }

    const sortArray = (array) => {
      const originalCopy = array.slice()
      return originalCopy.sort()
    }

    const copyInventory = async () => {
      copyToClipboard(sortArray(filteredInventory.value).join('\n')).then(
        () => {
          uiStore.notifySuccess($gettext('Text copied to clipboard'))
        },
      )
    }

    return {
      search,
      showSearch,
      expanded,
      filteredInventory,
      app,
      user,
      data,
      mask,
      network,
      project,
      name,
      uuid,
      helpdesk,
      syncEndDate,
      computerRam,
      computerStorage,
      computerMac,
      computerId,
      productIcon,
      cpuIcon,
      statusIcon,
      statusText,
      qrCode,
      inventory,
      host: programStore.host,
      serverVersion: programStore.serverVersion,
      organization: programStore.organization,
      client: programStore.clientVersion,
      printLabel,
      copyInventory,
    }
  },
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
