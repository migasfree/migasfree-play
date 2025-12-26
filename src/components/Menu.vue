<template>
  <!-- Desktop menu -->
  <div class="gt-xs">
    <template v-for="item in menuItems" :key="item.route">
      <q-btn
        v-if="item.show"
        flat
        round
        :icon="item.icon"
        size="lg"
        class="q-mx-xs"
        :disabled="$route.name === item.route"
        v-bind="
          item.external ? { type: 'a', target: '_blank', href: item.href } : {}
        "
        @click="!item.external && $router.push({ name: item.route })"
      >
        <q-tooltip>{{ item.label }}</q-tooltip>
      </q-btn>
    </template>
  </div>

  <!-- Mobile dropdown menu -->
  <div class="lt-sm">
    <q-btn-dropdown flat stretch>
      <template #label>
        <q-icon name="mdi-menu" size="lg" />
        <q-tooltip>{{ $gettext('Menu') }}</q-tooltip>
      </template>
      <q-list bordered separator>
        <template v-for="item in menuItems" :key="item.route">
          <q-item
            v-if="item.show && (item.external || $route.name !== item.route)"
            clickable
            v-bind="
              item.external
                ? { tag: 'a', target: '_blank', href: item.href }
                : {}
            "
            @click="!item.external && $router.push({ name: item.route })"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="lg" />
            </q-item-section>

            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'

import { urlHelp } from 'config/app.conf'

import { usePreferencesStore } from 'src/stores/preferences'

const { $gettext } = useGettext()

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

const menuItems = computed(() => [
  {
    route: 'apps',
    icon: 'apps',
    label: $gettext('Apps'),
    show: showApps.value,
  },
  {
    route: 'devices',
    icon: 'mdi-printer',
    label: $gettext('Devices'),
    show: showDevices.value,
  },
  {
    route: 'tags',
    icon: 'mdi-tag',
    label: $gettext('Tags'),
    show: showTags.value,
  },
  {
    route: 'details',
    icon: 'mdi-list-status',
    label: $gettext('Details'),
    show: showDetails.value,
  },
  {
    route: 'info',
    icon: 'info',
    label: $gettext('Info'),
    show: showInfo.value,
  },
  {
    route: 'preferences',
    icon: 'mdi-cog',
    label: $gettext('Preferences'),
    show: showPreferences.value,
  },
  {
    route: 'help',
    icon: 'help',
    label: $gettext('Help'),
    show: showHelp.value,
    external: true,
    href: urlHelp,
  },
])
</script>
