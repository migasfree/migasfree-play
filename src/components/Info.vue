<template>
  <div>
    <div class="no-print">
      <center>
        <p>
          <img id="logo" src="img/migasfree-play.svg" />
        </p>
        <p id="app-name">{{ appName }} {{ appVersion }}</p>
        <p>{{ appDescription }}</p>
        <p>{{ appCopyright }}</p>
        <p>{{ appAuthors }}</p>
      </center>

      <q-card flat bordered class="flex flex-center q-ma-md">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="mdi-account" />
            {{ computer.user }}
          </div>

          <div>
            <q-icon name="mdi-calendar-check" />
            {{ syncEndDate }}
            <q-tooltip>{{ $gettext('Last synchronization') }}</q-tooltip>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="flex flex-center q-ma-md">
        <q-card-section>
          <div class="text-h6">
            <q-icon :name="productIcon" />
            {{ computer.data.product }}
          </div>

          <div>
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
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="flex flex-center q-ma-md">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="mdi-information" />
            {{ computer.data.fqdn }}
          </div>

          <div>
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
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="flex flex-center q-ma-md">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="mdi-server" />
            {{ $store.getters['app/host'] }}
          </div>
          <div>
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
              {{ computer.data.status }}
            </p>
            <q-tooltip>{{ $gettext('Migasfree Data') }}</q-tooltip>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div id="qr" class="ui grid">
      <div class="two wide column"></div>
      <div class="three wide column bordered">
        <div class="image">
          <qrcode
            :value="qrCode"
            :options="{ width: 140, errorCorrectionLevel: 'low' }"
          />
        </div>
      </div>
      <div class="nine wide column bordered">
        <div class="item">
          <div class="content">
            <div class="header">
              {{ computer.name }}
            </div>
            <div class="description">
              <p>{{ computer.uuid }}</p>
              <p>{{ $store.getters['app/host'] }}</p>
              <p>{{ computer.helpdesk }}</p>
            </div>
            <div class="extra">
              <q-btn color="positive" icon="mdi-printer" @click="printLabel">
                <i class="print icon" />
                <q-tooltip>{{ $gettext('Print') }}</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { date } from 'quasar'
import Vue from 'vue'
import VueQrcode from '@chenfengyuan/vue-qrcode'
const app = require('../../package.json')

Vue.component(VueQrcode.name, VueQrcode)

export default {
  name: 'Info',
  data() {
    return {
      appName: app.name,
      appVersion: app.version,
      appDescription: app.description,
      appAuthors: app.author,
      appCopyright: app.copyright
    }
  },
  computed: {
    computer() {
      console.log(this.$store.getters['computer/getComputer'])
      return this.$store.getters['computer/getComputer']
    },

    syncEndDate() {
      return date.formatDate(
        Date.parse(this.computer.data.sync_end_date),
        'YYYY-MM-DD HH:mm:ss'
      )
    },

    computerRam() {
      return this.bytesToGigas(this.computer.data.ram) + ' GB RAM'
    },

    computerStorage() {
      return (
        this.bytesToGigas(this.computer.data.storage) +
        ' GB (' +
        this.computer.data.disks +
        ' ' +
        this.$gettext('disks') +
        ')'
      )
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
      return `CID-${this.computer.cid}`
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
        case 'unknown':
          return 'mdi-crosshairs-question'
        case 'unsubscribed':
          return 'mdi-recycle-variant'
        default:
          return 'mdi-heart-pulse'
      }
    },

    qrCode() {
      let info = {
        model: 'Computer',
        id: this.computer.cid,
        server: this.$store.getters['app/host']
      }

      return JSON.stringify(info)
    }
  },
  methods: {
    bytesToGigas(value) {
      return (value / 1024 / 1024 / 1024).toFixed(1)
    },

    printLabel() {
      window.print()
    }
  }
}
</script>

<style scoped>
#logo {
  width: 20%;
}

#app-name {
  font-size: 150%;
}

#qr {
  margin: 14px 0;
}

.three.bordered {
  border: 1px solid #000;
  border-right: 0;
}

.nine.bordered {
  border: 1px solid #000;
  border-left: 0;
}

.nine .item {
  padding-top: 18px;
}
</style>
