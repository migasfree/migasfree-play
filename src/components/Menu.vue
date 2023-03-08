<template>
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

      <q-item v-if="showHelp" clickable tag="a" target="_blank" :href="urlHelp">
        <q-item-section avatar>
          <q-icon name="help" size="lg" />
        </q-item-section>

        <q-item-section><translate>Help</translate></q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
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
