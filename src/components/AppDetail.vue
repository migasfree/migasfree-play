<template>
  <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
    <q-card unelevated class="glass-card app-card">
      <q-card-section horizontal class="q-pa-md items-center">
        <q-card-section class="col q-pa-none">
          <div class="text-overline text-grey-7 category-label">
            {{ category }}
          </div>
          <div class="text-subtitle1 text-weight-bolder app-name">
            {{ name }}
          </div>
          <div class="q-mt-xs">
            <q-rating
              :model-value="props.score"
              color="primary"
              size="18px"
              readonly
            />
          </div>
        </q-card-section>

        <q-card-section class="col-auto q-pa-none">
          <div class="app-icon-wrapper flex flex-center">
            <q-img
              :src="icon"
              class="app-icon"
              :placeholder-src="defaultIcon"
              fit="contain"
            >
              <template #error>
                <q-img :src="defaultIcon" fit="contain" />
              </template>
            </q-img>
          </div>
        </q-card-section>
      </q-card-section>

      <q-card-section class="q-px-md q-py-sm">
        <template v-if="moreInfo">
          <q-expansion-item
            dense
            header-class="text-body2 text-muted q-pa-none description-toggle"
            :label="truncatedDescription"
          >
            <q-card flat class="bg-surface-variant q-mt-sm">
              <q-card-section class="text-body2 q-pa-md">
                <q-markdown :src="moreInfo" no-link no-linkify></q-markdown>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </template>
        <div v-else class="text-muted text-body2 truncated-text">
          {{ truncatedDescription }}
        </div>
      </q-card-section>

      <q-card-actions class="q-px-md q-pb-md row items-center justify-between">
        <div class="row q-gutter-x-sm">
          <q-btn
            v-if="isInstallable"
            flat
            round
            dense
            color="positive"
            icon="mdi-download"
            class="action-btn"
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
            class="action-btn"
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
            color="orange-10"
            icon="mdi-wizard-hat"
            class="action-btn"
            @click="$emit('openlogin')"
          >
            <q-tooltip>{{ $gettext('Manage with privileges') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="!isAvailable"
            flat
            round
            dense
            color="brown-8"
            icon="mdi-lock"
            class="action-btn"
          >
            <q-tooltip>{{ $gettext('Locked') }}</q-tooltip>
          </q-btn>
        </div>

        <Transition name="bounce">
          <q-chip
            v-if="isInstalled"
            color="positive"
            icon="mdi-check-circle"
            class="text-weight-bold"
            outline
            dense
            size="12px"
          >
            {{ $gettext('Installed') }}
          </q-chip>
        </Transition>
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

<style lang="scss" scoped>
.app-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-card:hover {
  border-color: var(--brand-primary) !important;
}

.category-label {
  line-height: 1;
  margin-bottom: 2px;
}

.app-name {
  line-height: 1.2;
}

.app-icon-wrapper {
  width: 72px;
  height: 72px;
  padding: 8px;
}

.app-icon {
  width: 100%;
  height: 100%;
}

.description-toggle {
  min-height: auto;
  line-height: 1.4;
}

.truncated-text {
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.action-btn {
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
}

.body--dark {
  .app-card:hover {
    border-color: var(--q-accent) !important;
  }
  .app-icon-wrapper {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
