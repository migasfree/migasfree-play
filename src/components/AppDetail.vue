<template>
  <div class="col-md-6 col-sm-6 col-xs-12 q-pa-sm">
    <q-card bordered>
      <q-card-section horizontal>
        <q-card-section class="col-8">
          <div class="text-h5">
            {{ name }}
          </div>
          <div class="text-caption text-muted">
            {{ category }}
          </div>
          <q-rating :model-value="props.score" color="primary" readonly />
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
            <template #default>
              <q-card v-if="moreInfo" class="q-pa-md">
                <q-markdown :src="moreInfo" no-link no-linkify></q-markdown>
              </q-card>
            </template>
          </q-expansion-item>
        </template>
        <div v-else class="text-muted text-body2">
          {{ truncatedDescription }}
        </div>
      </q-card-section>

      <q-card-actions class="q-gutter-md">
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            v-if="isInstallable"
            flat
            round
            dense
            color="positive"
            icon="mdi-download"
            :loading="isRunningCommand"
            :disabled="isRunningCommand"
            @click="installApp(props.name, props.packages)"
          >
            <q-tooltip>
              {{ $gettext('Install') }} ({{ props.packages.join(', ') }})
            </q-tooltip>
          </q-btn>

          <q-btn
            v-if="isRemovable"
            flat
            round
            dense
            color="negative"
            icon="mdi-delete"
            :loading="isRunningCommand"
            :disabled="isRunningCommand"
            @click="removeApp(props.name, props.packages)"
          >
            <q-tooltip>
              {{ $gettext('Uninstall') }} ({{ props.packages.join(', ') }})
            </q-tooltip>
          </q-btn>

          <q-btn
            v-if="isPrivileged"
            flat
            round
            dense
            color="orange"
            icon="mdi-wizard-hat"
            @click="$emit('openlogin')"
          >
            <q-tooltip>{{ $gettext('Manage with privileges') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="!isAvailable"
            flat
            round
            dense
            color="brown"
            icon="mdi-lock"
          >
            <q-tooltip>{{ $gettext('Locked') }}</q-tooltip>
          </q-btn>

          <Transition name="bounce">
            <q-chip
              v-if="isInstalled"
              color="positive"
              icon="mdi-check-circle"
              outline
              dense
            >
              {{ $gettext('Installed') }}
            </q-chip>
          </Transition>
        </div>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'

import { useComputerStore } from 'src/stores/computer'
import { useExecutionsStore } from 'src/stores/executions'
import { usePackagesStore } from 'src/stores/packages'
import { useProgramStore } from 'src/stores/program'
import { useUiStore } from 'src/stores/ui'

const props = defineProps({
  icon: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  score: { type: Number, required: false, default: 0 },
  description: { type: String, required: false, default: '' },
  level: { type: String, required: false, default: 'U' },
  packages: { type: Array, required: false, default: () => [] },
})

defineEmits(['openlogin'])

const { $gettext, interpolate } = useGettext()

const computerStore = useComputerStore()
const executionsStore = useExecutionsStore()
const packagesStore = usePackagesStore()
const programStore = useProgramStore()
const uiStore = useUiStore()

const { isRunningCommand } = storeToRefs(executionsStore)
const { availableSet, installedSet } = storeToRefs(packagesStore)
const { clientVersion, userIsPrivileged } = storeToRefs(programStore)

const { platform } = storeToRefs(computerStore)

const truncatedDescription = computed(() => props.description.split('\n')[0])

const moreInfo = computed(() => {
  const lines = props.description.split('\n')
  const trimmed = lines.slice(1)
  return trimmed.join('\n')
})

const isInstalled = computed(
  () =>
    props.packages.length > 0 &&
    props.packages.every((pkg) => installedSet.value.has(pkg)),
)

const isAvailable = computed(() =>
  props.packages.every((pkg) => availableSet.value.has(pkg)),
)

const isInstallable = computed(
  () =>
    (props.level === 'U' || userIsPrivileged.value) &&
    isAvailable.value &&
    !isInstalled.value &&
    props.packages.length > 0,
)

const isRemovable = computed(
  () => isInstalled.value && (props.level === 'U' || userIsPrivileged.value),
)

const isPrivileged = computed(
  () => isAvailable.value && props.level === 'A' && !userIsPrivileged.value,
)

const defaultIcon = computed(() => 'img/migasfree-play.svg')

const installApp = (name, packages) => {
  if (!packages?.length) return

  const cmd = {
    command: 'migasfree',
    args: [],
    input: '',
    env: {},
  }

  if (clientVersion.value.startsWith('4.')) {
    // Legacy: migasfree --install --package=p1 p2 ...
    // Splitting logic: --package=p1 is one arg, p2... are subsequent args
    cmd.args = ['--install', `--package=${packages[0]}`, ...packages.slice(1)]
  } else {
    // Modern: migasfree install p1 p2 ...
    cmd.args = ['install', ...packages]
  }

  if (platform.value === 'linux') {
    cmd.input = 'y\n'
    cmd.env = { LC_ALL: 'C' }
  }

  const message = interpolate($gettext('Installing %{name}'), { name })

  uiStore.notifyInfo(message)

  executionsStore.run({
    cmd,
    text: message,
    icon: 'mdi-download',
  })
}

const removeApp = (name, packages) => {
  const cmd = {
    command: 'migasfree',
    args: [],
    input: '',
    env: {},
  }

  if (clientVersion.value.startsWith('4.')) {
    cmd.args = ['--remove', `--package=${packages[0]}`, ...packages.slice(1)]
  } else {
    cmd.args = ['purge', ...packages]
  }

  if (platform.value === 'linux') {
    cmd.input = 'y\n'
    cmd.env = { LC_ALL: 'C' }
  }

  const message = interpolate($gettext('Uninstalling %{name}'), { name })

  uiStore.notifyInfo(message)

  executionsStore.run({
    cmd,
    text: message,
    icon: 'mdi-delete',
  })
}
</script>
