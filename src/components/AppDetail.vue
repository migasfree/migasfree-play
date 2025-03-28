<template>
  <div class="col-md-6 col-sm-6 col-xs-12 q-pa-sm">
    <q-card flat bordered>
      <q-card-section horizontal>
        <q-card-section class="col-8">
          <div class="text-h5">
            {{ name }}
          </div>
          <div class="text-caption text-blue-grey">
            {{ category }}
          </div>
          <q-rating v-model="rating" color="primary" readonly />
        </q-card-section>

        <q-card-section class="col-4 text-right">
          <q-img
            :src="icon"
            width="72px"
            height="72px"
            :placeholder-src="defaultIcon"
            fit="contain"
          >
            <template #error>
              <q-img :src="defaultIcon" fit="contain" />
            </template>
          </q-img>
        </q-card-section>
      </q-card-section>

      <q-card-section>
        <template v-if="moreInfo">
          <q-expansion-item :label="truncatedDescription">
            <q-card>
              <q-markdown :src="moreInfo" no-link no-linkify></q-markdown>
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
          :loading="isRunningCommand"
          :disabled="isRunningCommand"
          @click="installApp(name, packages)"
        >
          <q-tooltip
            >{{ $gettext('Install') }} ({{ packages.join(', ') }})</q-tooltip
          >
        </q-btn>

        <q-btn
          v-if="isRemovable"
          color="negative"
          icon="mdi-delete"
          :loading="isRunningCommand"
          :disabled="isRunningCommand"
          @click="removeApp(name, packages)"
        >
          <q-tooltip
            >{{ $gettext('Uninstall') }} ({{ packages.join(', ') }})</q-tooltip
          >
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
import os from 'os'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'

import { useExecutionsStore } from 'src/stores/executions'
import { usePackagesStore } from 'src/stores/packages'
import { useProgramStore } from 'src/stores/program'
import { useUiStore } from 'src/stores/ui'

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
  setup(props) {
    const { $gettext, interpolate } = useGettext()

    const executionsStore = useExecutionsStore()
    const packagesStore = usePackagesStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { isRunningCommand } = storeToRefs(executionsStore)
    const { available, installed } = storeToRefs(packagesStore)
    const { clientVersion, userIsPrivileged } = storeToRefs(programStore)

    const rating = computed(() => props.score)

    const truncatedDescription = computed(
      () => props.description.split('\n')[0],
    )

    const moreInfo = computed(() => {
      let items = props.description.split('\n')
      items.shift()
      return items.join('\n')
    })

    const packages = computed(() => JSON.parse(JSON.stringify(props.packages)))
    const installedPackages = computed(() =>
      JSON.parse(JSON.stringify(installed.value)),
    )
    const availablePackages = computed(() =>
      JSON.parse(JSON.stringify(available.value)),
    )

    const isInstalled = computed(
      () =>
        packages.value.length > 0 &&
        packages.value.filter((x) => !installedPackages.value.includes(x))
          .length === 0,
    )

    const isAvailable = computed(() =>
      packages.value.filter((x) => !availablePackages.value.includes(x)),
    )

    const isInstallable = computed(
      () =>
        (props.level === 'U' || userIsPrivileged.value) &&
        isAvailable.value &&
        !isInstalled.value &&
        packages.value.length > 0,
    )

    const isRemovable = computed(
      () =>
        isInstalled.value && (props.level === 'U' || userIsPrivileged.value),
    )

    const isPrivileged = computed(
      () => isAvailable.value && props.level === 'A' && !userIsPrivileged.value,
    )

    const defaultIcon = computed(() => 'img/migasfree-play.svg')

    const installApp = (name, packages) => {
      const packagesToInstall = packages.join(' ')
      let cmd = `migasfree install ${packagesToInstall}`
      if (clientVersion.value.startsWith('4.'))
        cmd = `migasfree --install --package=${packagesToInstall}`

      if (os.type() === 'Linux') cmd = 'LANG_ALL=C echo "y" | ' + cmd

      uiStore.notifyInfo(
        interpolate($gettext('Installing %{name}'), {
          name,
        }),
      )

      executionsStore.run({
        cmd,
        text: interpolate($gettext('Installing %{name}'), {
          name,
        }),
        icon: 'mdi-download',
      })
    }

    const removeApp = (name, packages) => {
      const packagesToRemove = packages.join(' ')
      let cmd = `migasfree purge ${packagesToRemove}`
      if (clientVersion.value.startsWith('4.'))
        cmd = `migasfree --remove --package=${packagesToRemove}`

      if (os.type() === 'Linux') cmd = 'LANG_ALL=C echo "y" | ' + cmd

      uiStore.notifyInfo(
        interpolate($gettext('Uninstalling %{name}'), {
          name,
        }),
      )

      executionsStore.run({
        cmd,
        text: interpolate($gettext('Uninstalling %{name}'), {
          name,
        }),
        icon: 'mdi-delete',
      })
    }

    return {
      rating,
      truncatedDescription,
      moreInfo,
      isInstalled,
      isAvailable,
      isInstallable,
      isRemovable,
      isPrivileged,
      isRunningCommand,
      installApp,
      removeApp,
      defaultIcon,
    }
  },
}
</script>
