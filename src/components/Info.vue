<template>
  <div class="print-hide">
    <div class="column items-center">
      <p>
        <img width="120" src="img/migasfree-play.svg" />
      </p>

      <p class="text-h5">
        <strong>{{ appName }} {{ appVersion }}</strong>
      </p>

      <p class="text-caption text-center">
        {{ appDescription }} <br />{{ appCopyright }} <br />{{ appAuthors }}
      </p>

      <q-card v-if="computer.user" flat bordered class="half q-ma-md">
        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-account" />
          </q-item-section>

          <q-item-section class="text-h6">{{ computer.user }}</q-item-section>
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

      <q-card
        v-if="'product' in computer.data"
        flat
        bordered
        class="half q-ma-md"
      >
        <q-item>
          <q-item-section avatar>
            <q-icon :name="productIcon" />
          </q-item-section>

          <q-item-section class="text-h6">{{
            computer.data.product
          }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon :name="cpuIcon" />
          </q-item-section>

          <q-item-section class="text-h6">{{
            computer.data.cpu
          }}</q-item-section>
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

      <q-card
        v-if="'mac_address' in computer.data"
        flat
        bordered
        class="half q-ma-md"
      >
        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-information" />
          </q-item-section>

          <q-item-section class="text-h6">{{
            computer.data.fqdn
          }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-ip-network" />
          </q-item-section>

          <q-item-section class="text-h6"
            >{{ computer.data.ip_address }} / {{ computer.mask }} ({{
              computer.network
            }})</q-item-section
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

          <q-item-section class="text-h6">{{ host }}</q-item-section>
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

          <q-item-section class="text-h6">{{
            computer.project
          }}</q-item-section>
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
  </div>

  <div class="column items-center">
    <q-card flat bordered class="identification">
      <q-card-section horizontal>
        <vue-qrcode
          :value="qrCode"
          :options="{ width: 140, errorCorrectionLevel: 'low' }"
        />

        <q-card-section vertical class="justify-around q-px-md">
          <p>{{ computer.name }} ({{ computerId }})</p>
          <div class="text-caption text-blue-grey">
            <p>{{ computer.uuid }}</p>
            <p>{{ host }}</p>
            <p>{{ computer.helpdesk }}</p>
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
          <q-tooltip>{{ $gettext('Print Identification') }}</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useGettext } from 'vue3-gettext'

import VueQrcode from '@chenfengyuan/vue-qrcode'
import DateView from 'components/DateView'

import { useAppStore } from 'src/stores/app'
import { useComputerStore } from 'src/stores/computer'

const app = require('../../package.json')

export default {
  name: 'Info',
  components: {
    DateView,
    VueQrcode,
  },
  setup() {
    const { $gettext } = useGettext()

    const appStore = useAppStore()
    const computerStore = useComputerStore()

    const appName = ref(app.name)
    const appVersion = ref(app.version)
    const appDescription = ref(app.description)
    const appAuthors = ref(app.author)
    const appCopyright = ref(app.copyright)

    const computer = computed(() => computerStore.getComputer)

    const syncEndDate = computed(() =>
      'sync_end_date' in computer.value.data
        ? computer.value.data.sync_end_date
        : ''
    )

    const computerRam = computed(() =>
      'ram' in computer.value.data
        ? `${bytesToGigas(computer.value.data.ram)} GB RAM`
        : ''
    )

    const computerStorage = computed(() =>
      'storage' in computer.value.data
        ? `${bytesToGigas(computer.value.data.storage)} GB (${
            computer.value.data.disks
          } ${$gettext('disks')})`
        : ''
    )

    const computerMac = computed(() => {
      const ret = []

      if (computer.value.data.mac_address) {
        let tmp = ''
        for (let i = 0; i < computer.value.data.mac_address.length; i += 12) {
          tmp = computer.value.data.mac_address.substring(i, i + 12)
          ret.push(tmp.replace(/(.{2})/g, '$1:').slice(0, -1))
        }
      }

      return ret.join(', ')
    })

    const computerId = computed(() =>
      computer.value.cid ? `CID-${computer.value.cid}` : 'CID-?'
    )

    const productIcon = computed(() => {
      switch (computer.value.data.product_system) {
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

    const cpuIcon = computed(
      () => `mdi-cpu-${computer.value.data.architecture}-bit`
    )

    const statusIcon = computed(() => {
      switch (computer.value.data.status) {
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
      switch (computer.value.data.status) {
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
        id: computer.value.cid,
        server: appStore.host,
      }

      return JSON.stringify(info)
    })

    const bytesToGigas = (value) => {
      return (value / 1024 / 1024 / 1024).toFixed(1)
    }

    const printLabel = () => {
      window.print()
    }

    return {
      appName,
      appVersion,
      appDescription,
      appAuthors,
      appCopyright,
      computer,
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
      host: appStore.host,
      organization: appStore.organization,
      printLabel,
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
