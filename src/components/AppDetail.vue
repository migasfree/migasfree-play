<template>
  <div class="col-md-6 col-sm-6 col-xs-12 q-pa-sm">
    <q-card flat bordered>
      <q-card-section horizontal>
        <q-card-section class="col-9">
          <div class="text-h5">
            {{ name }}
          </div>
          <div class="text-caption text-blue-grey">
            {{ category }}
          </div>
          <q-rating v-model="rating" color="primary" readonly />
        </q-card-section>

        <q-card-section class="col-3">
          <img :src="icon" width="64" @error="defaultIcon" />
        </q-card-section>
      </q-card-section>

      <q-card-section>
        <template v-if="moreInfo">
          <q-expansion-item :label="truncatedDescription">
            <q-card>
              <q-markdown :src="moreInfo"></q-markdown>
            </q-card>
          </q-expansion-item>
        </template>
        <q-markdown v-else :src="truncatedDescription"></q-markdown>
      </q-card-section>

      <q-card-actions class="q-gutter-md">
        <q-btn
          v-if="isInstallable"
          color="positive"
          icon="mdi-download"
          :loading="$store.state.executions.isRunningCommand"
          :disabled="$store.state.executions.isRunningCommand"
          @click="installApp(name, packages)"
        >
          <q-tooltip>{{ $gettext('Install') }}</q-tooltip>
        </q-btn>

        <q-btn
          v-if="isRemovable"
          color="negative"
          icon="mdi-delete"
          :loading="$store.state.executions.isRunningCommand"
          :disabled="$store.state.executions.isRunningCommand"
          @click="removeApp(name, packages)"
        >
          <q-tooltip>{{ $gettext('Uninstall') }}</q-tooltip>
        </q-btn>

        <q-btn
          v-if="isPrivileged"
          color="orange"
          icon="mdi-wizard-hat"
          @click="$emit('openlogin')"
        >
          <q-tooltip>{{ $gettext('Manage with privileges') }}</q-tooltip>
        </q-btn>

        <q-btn v-if="!isAvailable" color="brown" icon="mdi-lock">
          <q-tooltip>{{ $gettext('Locked') }}</q-tooltip>
        </q-btn>

        <q-chip v-if="isInstalled" outline color="primary" text-color="white">
          {{ $gettext('Installed') }}
        </q-chip>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
const os = require('os')

export default {
  name: 'AppDetail',
  props: {
    icon: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    score: { type: Number, required: false, default: 0 },
    description: { type: String, required: false, default: '' },
    level: { type: String, required: false, default: 'U' },
    packages: { type: Array, required: false, default: () => [] },
  },
  emits: ['openlogin'],
  computed: {
    rating() {
      return this.score
    },

    truncatedDescription() {
      return this.description.split('\n')[0]
    },

    moreInfo() {
      let items = this.description.split('\n')
      items.shift()
      return items.join('\n')
    },

    isInstalled() {
      return (
        this.packages.length > 0 &&
        this.packages.filter(
          (x) => !this.$store.state.packages.installed.includes(x)
        ).length === 0
      )
    },

    isAvailable() {
      return this.packages.filter(
        (x) => !this.$store.state.packages.available.includes(x)
      )
    },

    isInstallable() {
      return (
        (this.level === 'U' || this.$store.getters['app/userIsPrivileged']) &&
        this.isAvailable &&
        !this.isInstalled &&
        this.packages.length > 0
      )
    },

    isRemovable() {
      return (
        this.isInstalled &&
        (this.level === 'U' || this.$store.getters['app/userIsPrivileged'])
      )
    },

    isPrivileged() {
      return (
        this.isAvailable &&
        this.level === 'A' &&
        !this.$store.getters['app/userIsPrivileged']
      )
    },
  },
  methods: {
    installApp(name, packages) {
      const packagesToInstall = packages.join(' ')
      let cmd

      this.$store.dispatch(
        'ui/notifyInfo',
        this.$gettextInterpolate(this.$gettext('Installing %{name}'), {
          name,
        })
      )

      cmd = `migasfree install ${packagesToInstall}`
      if (os.type() === 'Linux') cmd = 'LANG_ALL=C echo "y" | ' + cmd

      this.$store.dispatch('executions/run', {
        cmd,
        text: this.$gettextInterpolate(this.$gettext('Installing %{name}'), {
          name,
        }),
        icon: 'mdi-download',
      })
    },

    removeApp(name, packages) {
      const packagesToRemove = packages.join(' ')
      let cmd

      this.$store.dispatch(
        'ui/notifyInfo',
        this.$gettextInterpolate(this.$gettext('Uninstalling %{name}'), {
          name,
        })
      )

      cmd = `migasfree purge ${packagesToRemove}`
      if (os.type() === 'Linux') cmd = 'LANG_ALL=C echo "y" | ' + cmd

      this.$store.dispatch('executions/run', {
        cmd,
        text: this.$gettextInterpolate(this.$gettext('Uninstalling %{name}'), {
          name,
        }),
        icon: 'mdi-delete',
      })
    },

    defaultIcon(event) {
      event.target.src = 'img/migasfree-play.svg'
    },
  },
}
</script>
