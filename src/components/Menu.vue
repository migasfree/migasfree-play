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
        class="q-mx-xs menu-btn"
        :color="$route.name === item.route ? 'primary' : 'grey-7'"
        :class="{
          'active-menu-btn': !item.external && $route.name === item.route,
        }"
        v-bind="item.external ? { target: '_blank', href: item.href } : {}"
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
            v-if="item.show"
            clickable
            :active="!item.external && $route.name === item.route"
            active-class="text-primary text-weight-bold bg-primary-light"
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
    icon: 'mdi-apps',
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
    icon: 'mdi-script-text-outline',
    label: $gettext('Details'),
    show: showDetails.value,
  },
  {
    route: 'info',
    icon: 'mdi-information',
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
    icon: 'mdi-help-circle-outline',
    label: $gettext('Help'),
    show: showHelp.value,
    external: true,
    href: urlHelp,
  },
])
</script>

<style lang="scss" scoped>
.menu-btn {
  transition: all 0.3s ease;
}

.active-menu-btn {
  background: rgba(var(--q-primary-rgb), 0.1) !important;
  color: var(--q-primary) !important;
  transform: translateY(-2px);
}

.body--dark .active-menu-btn {
  background: rgba(var(--q-accent-rgb), 0.15) !important;
  color: var(--q-accent) !important;
}

.bg-primary-light {
  background: rgba(var(--q-primary-rgb), 0.1) !important;
}

.body--dark .bg-primary-light {
  background: rgba(var(--q-accent-rgb), 0.15) !important;
  color: var(--q-accent) !important;
}
</style>
