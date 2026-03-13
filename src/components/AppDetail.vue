<template>
  <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
    <q-card unelevated class="glass-card app-card">
      <q-card-section horizontal class="q-pa-md items-center">
        <q-card-section class="col q-pa-none">
          <div class="text-overline text-grey-7 category-label">
            {{ category }}
          </div>
          <h3 class="text-subtitle1 text-weight-bolder app-name q-ma-none">
            {{ name }}
          </h3>
          <div class="q-mt-xs">
            <q-rating
              :model-value="props.score"
              color="primary"
              size="18px"
              readonly
              :aria-label="
                interpolate($gettext('Score: %{score} out of 5 stars'), {
                  score: props.score,
                })
              "
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
              :alt="$gettext('app icon')"
            >
              <template #error>
                <q-img :src="defaultIcon" fit="contain" />
              </template>
            </q-img>
          </div>
        </q-card-section>
      </q-card-section>

      <q-card-section class="q-px-md q-py-sm col">
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
            :icon="appIcon('install')"
            class="action-hover"
            :loading="isRunningCommand"
            :disabled="isRunningCommand"
            :aria-label="$gettext('Install App')"
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
            :icon="appIcon('uninstall')"
            class="action-hover"
            :loading="isRunningCommand"
            :disabled="isRunningCommand"
            :aria-label="$gettext('Uninstall App')"
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
            :icon="appIcon('unlock')"
            class="action-hover"
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
            :icon="appIcon('lock')"
            class="action-hover"
          >
            <q-tooltip>{{ $gettext('Locked') }}</q-tooltip>
          </q-btn>
        </div>

        <Transition name="bounce">
          <q-chip
            v-if="isInstalled"
            color="positive"
            :icon="appIcon('success')"
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
import { useCommand } from 'src/composables/useCommand'
import { appIcon } from 'src/composables/element'

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
const { userIsPrivileged } = storeToRefs(programStore)

const { platform } = storeToRefs(computerStore)
const { buildMigasfreeCommand } = useCommand()

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

  const cmd = buildMigasfreeCommand('install', packages)

  if (platform.value === 'linux') {
    cmd.input = 'y\n'
    cmd.env = { LC_ALL: 'C' }
  }

  const message = interpolate($gettext('Installing %{name}'), { name })

  uiStore.notifyInfo(message)

  executionsStore.run({
    cmd,
    text: message,
    icon: appIcon('install'),
  })
}

const removeApp = (name, packages) => {
  const cmd = buildMigasfreeCommand('remove', packages)

  if (platform.value === 'linux') {
    cmd.input = 'y\n'
    cmd.env = { LC_ALL: 'C' }
  }

  const message = interpolate($gettext('Uninstalling %{name}'), { name })

  uiStore.notifyInfo(message)

  executionsStore.run({
    cmd,
    text: message,
    icon: appIcon('uninstall'),
  })
}
</script>

<style lang="scss" scoped>
.app-card {
  height: 100%;
  display: flex;
  flex-direction: column;
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

.body--dark {
  .app-icon-wrapper {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
