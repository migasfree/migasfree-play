<template>
  <div>
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
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="mdi-account" />
              {{ computer.user }}
            </div>

            <p>
              <q-icon name="mdi-calendar-check" />
              {{ syncEndDate }}
            </p>

            <q-tooltip>{{ $gettext('Last synchronization') }}</q-tooltip>
          </q-card-section>
        </q-card>

        <q-card
          v-if="'product' in computer.data"
          flat
          bordered
          class="half q-ma-md"
        >
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon :name="productIcon" />
              {{ computer.data.product }}
            </div>

            <p>
              <q-icon :name="cpuIcon" />
              {{ computer.data.cpu }}
            </p>

            <p>
              <q-icon name="mdi-memory" />
              {{ computerRam }}
            </p>

            <p>
              <q-icon name="mdi-harddisk" />
              {{ computerStorage }}
            </p>

            <q-tooltip>{{ $gettext('Hardware') }}</q-tooltip>
          </q-card-section>
        </q-card>

        <q-card
          v-if="'mac_address' in computer.data"
          flat
          bordered
          class="half q-ma-md"
        >
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="mdi-information" />
              {{ computer.data.fqdn }}
            </div>

            <p>
              <q-icon name="mdi-ip-network" />
              {{ computer.data.ip_address }}
              / {{ computer.mask }} ({{ computer.network }})
            </p>

            <p>
              <q-icon name="mdi-swap-vertical" />
              {{ computerMac }}
            </p>

            <q-tooltip>{{ $gettext('Network Data') }}</q-tooltip>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="half q-ma-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="mdi-server" />
              {{ $store.getters['app/host'] }}
            </div>

            <p>
              <q-icon name="mdi-sitemap" />
              {{ computer.project }}
            </p>

            <p>
              <q-icon name="mdi-pound" />
              {{ computerId }}
            </p>

            <p>
              <q-icon :name="statusIcon" />
              {{ statusText }}
            </p>

            <q-tooltip>{{ $gettext('Migasfree Data') }}</q-tooltip>
          </q-card-section>
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
              <p>{{ $store.getters['app/host'] }}</p>
              <p>{{ computer.helpdesk }}</p>
            </div>
          </q-card-section>
        </q-card-section>

        <q-separator inset />

        <q-card-actions align="center" class="print-hide">
          <q-btn
            color="positive"
            icon="mdi-printer"
            class="q-mx-lg"
            @click="printLabel"
          >
            <q-tooltip>{{ $gettext('Print Identification') }}</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script>
import { date } from 'quasar'
import VueQrcode from '@chenfengyuan/vue-qrcode'

const app = require('../../package.json')

export default {
  name: 'Info',
  components: {
    VueQrcode,
  },
  data() {
    return {
      appName: app.name,
      appVersion: app.version,
      appDescription: app.description,
      appAuthors: app.author,
      appCopyright: app.copyright,
    }
  },
  computed: {
    computer() {
      return this.$store.getters['computer/getComputer']
    },

    syncEndDate() {
      return 'sync_end_date' in this.computer.data
        ? date.formatDate(
            Date.parse(this.computer.data.sync_end_date),
            'YYYY-MM-DD HH:mm:ss'
          )
        : ''
    },

    computerRam() {
      return 'ram' in this.computer.data
        ? `${this.bytesToGigas(this.computer.data.ram)} GB RAM`
        : ''
    },

    computerStorage() {
      return 'storage' in this.computer.data
        ? `${this.bytesToGigas(this.computer.data.storage)} GB (${
            this.computer.data.disks
          } ${this.$gettext('disks')})`
        : ''
    },

    computerMac() {
      const ret = []

      if (this.computer.data.mac_address) {
        let tmp = ''
        for (let i = 0; i < this.computer.data.mac_address.length; i += 12) {
          tmp = this.computer.data.mac_address.substring(i, i + 12)
          ret.push(tmp.replace(/(.{2})/g, '$1:').slice(0, -1))
        }
      }

      return ret.join(', ')
    },

    computerId() {
      return this.computer.cid ? `CID-${this.computer.cid}` : 'CID-?'
    },

    productIcon() {
      switch (this.computer.data.product_system) {
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
    },

    cpuIcon() {
      return `mdi-cpu-${this.computer.data.architecture}-bit`
    },

    statusIcon() {
      switch (this.computer.data.status) {
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
    },

    statusText() {
      switch (this.computer.data.status) {
        case 'available':
          return this.$gettext('Available')
        case 'in repair':
          return this.$gettext('In repair')
        case 'reserved':
          return this.$gettext('Reserved')
        case 'intended':
          return this.$gettext('Intended')
        case 'unsubscribed':
          return this.$gettext('Unsubscribed')
        default:
          return this.$gettext('Unknown')
      }
    },

    qrCode() {
      let info = {
        model: 'computer',
        id: this.computer.cid,
        server: this.$store.getters['app/host'],
      }

      return JSON.stringify(info)
    },
  },
  methods: {
    bytesToGigas(value) {
      return (value / 1024 / 1024 / 1024).toFixed(1)
    },

    printLabel() {
      window.print()
    },
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
