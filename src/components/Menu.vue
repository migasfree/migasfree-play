<template>
  <div class="gt-xs">
    <q-btn
      v-if="showApps"
      flat
      round
      icon="apps"
      size="lg"
      class="q-mx-xs"
      :disabled="$route.name === 'apps'"
      @click="$router.push({ name: 'apps' })"
    >
      <q-tooltip>{{ $gettext('Apps') }}</q-tooltip>
    </q-btn>

    <q-btn
      v-if="showDevices"
      flat
      round
      icon="mdi-printer"
      size="lg"
      class="q-mx-xs"
      :disabled="$route.name === 'devices'"
      @click="$router.push({ name: 'devices' })"
    >
      <q-tooltip>{{ $gettext('Devices') }}</q-tooltip>
    </q-btn>

    <q-btn
      v-if="showTags"
      flat
      round
      icon="mdi-tag"
      size="lg"
      class="q-mx-xs"
      :disabled="$route.name === 'tags'"
      @click="$router.push({ name: 'tags' })"
    >
      <q-tooltip>{{ $gettext('Tags') }}</q-tooltip>
    </q-btn>

    <q-btn
      v-if="showDetails"
      flat
      round
      icon="mdi-list-status"
      size="lg"
      class="q-mx-xs"
      :disabled="$route.name === 'details'"
      @click="$router.push({ name: 'details' })"
    >
      <q-tooltip>{{ $gettext('Details') }}</q-tooltip>
    </q-btn>

    <q-btn
      v-if="showInfo"
      flat
      round
      icon="info"
      size="lg"
      class="q-mx-xs"
      :disabled="$route.name === 'info'"
      @click="$router.push({ name: 'info' })"
    >
      <q-tooltip>{{ $gettext('Info') }}</q-tooltip>
    </q-btn>

    <q-btn
      flat
      round
      icon="mdi-cog"
      size="lg"
      class="q-mx-xs"
      :disabled="$route.name === 'preferences'"
      @click="$router.push({ name: 'preferences' })"
    >
      <q-tooltip>{{ $gettext('Preferences') }}</q-tooltip>
    </q-btn>

    <q-btn
      v-if="showHelp"
      flat
      round
      icon="help"
      size="lg"
      class="q-mx-xs"
      type="a"
      target="_blank"
      :href="urlHelp"
    >
      <q-tooltip>{{ $gettext('Help') }}</q-tooltip>
    </q-btn>
  </div>

  <div class="lt-sm">
    <q-btn-dropdown flat stretch>
      <template #label>
        <q-icon name="mdi-menu" size="lg" />
        <q-tooltip>
          <translate>Menu</translate>
        </q-tooltip>
      </template>
      <q-list bordered separator>
        <q-item
          v-if="showApps && $route.name !== 'apps'"
          clickable
          @click="$router.push({ name: 'apps' })"
        >
          <q-item-section avatar>
            <q-icon name="apps" size="lg" />
          </q-item-section>

          <q-item-section><translate>Apps</translate></q-item-section>
        </q-item>

        <q-item
          v-if="showDevices && $route.name !== 'devices'"
          clickable
          @click="$router.push({ name: 'devices' })"
        >
          <q-item-section avatar>
            <q-icon name="mdi-printer" size="lg" />
          </q-item-section>

          <q-item-section><translate>Devices</translate></q-item-section>
        </q-item>

        <q-item
          v-if="showTags && $route.name !== 'tags'"
          clickable
          @click="$router.push({ name: 'tags' })"
        >
          <q-item-section avatar>
            <q-icon name="mdi-tag" size="lg" />
          </q-item-section>

          <q-item-section><translate>Tags</translate></q-item-section>
        </q-item>

        <q-item
          v-if="showDetails && $route.name !== 'details'"
          clickable
          @click="$router.push({ name: 'details' })"
        >
          <q-item-section avatar>
            <q-icon name="mdi-list-status" size="lg" />
          </q-item-section>

          <q-item-section><translate>Details</translate></q-item-section>
        </q-item>

        <q-item
          v-if="showInfo && $route.name !== 'info'"
          clickable
          @click="$router.push({ name: 'info' })"
        >
          <q-item-section avatar>
            <q-icon name="info" size="lg" />
          </q-item-section>

          <q-item-section><translate>Info</translate></q-item-section>
        </q-item>

        <q-item
          v-if="showPreferences && $route.name !== 'preferences'"
          clickable
          @click="$router.push({ name: 'preferences' })"
        >
          <q-item-section avatar>
            <q-icon name="mdi-cog" size="lg" />
          </q-item-section>

          <q-item-section><translate>Preferences</translate></q-item-section>
        </q-item>

        <q-item
          v-if="showHelp"
          clickable
          tag="a"
          target="_blank"
          :href="urlHelp"
        >
          <q-item-section avatar>
            <q-icon name="help" size="lg" />
          </q-item-section>

          <q-item-section><translate>Help</translate></q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script>
import { storeToRefs } from 'pinia'

import { urlHelp } from 'config/app.conf'

import { usePreferencesStore } from 'src/stores/preferences'

export default {
  setup() {
    const preferencesStore = usePreferencesStore()
    const {
      showApps,
      showDevices,
      showTags,
      showDetails,
      showInfo,
      showPreferences,
      showHelp,
    } = storeToRefs(preferencesStore)

    return {
      urlHelp,
      showApps,
      showDevices,
      showTags,
      showDetails,
      showInfo,
      showPreferences,
      showHelp,
    }
  },
}
</script>
