<template>
  <!-- Desktop menu -->
  <div class="menu-desktop">
    <template v-for="item in menuItems" :key="item.route">
      <q-btn
        v-if="item.show"
        flat
        round
        :icon="item.icon"
        size="16px"
        padding="8px"
        class="q-mx-xs menu-btn"
        :color="$route.name === item.route ? 'primary' : 'grey-7'"
        :class="{
          'active-menu-btn': !item.external && $route.name === item.route,
        }"
        :aria-label="item.label"
        v-bind="item.external ? { target: '_blank', href: item.href } : {}"
        @click="!item.external && $router.push({ name: item.route })"
      >
        <q-tooltip>{{ item.label }}</q-tooltip>
      </q-btn>
    </template>
  </div>

  <!-- Mobile dropdown menu -->
  <div class="menu-mobile">
    <q-btn-dropdown flat stretch :aria-label="$gettext('Menu')">
      <template #label>
        <q-icon :name="appIcon('menu')" size="lg" />
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
import { appIcon } from 'src/composables/element'

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
    icon: appIcon('apps'),
    label: $gettext('Apps'),
    show: showApps.value,
  },
  {
    route: 'devices',
    icon: appIcon('devices'),
    label: $gettext('Devices'),
    show: showDevices.value,
  },
  {
    route: 'tags',
    icon: appIcon('tags'),
    label: $gettext('Tags'),
    show: showTags.value,
  },
  {
    route: 'details',
    icon: appIcon('details'),
    label: $gettext('Details'),
    show: showDetails.value,
  },
  {
    route: 'info',
    icon: appIcon('info'),
    label: $gettext('Info'),
    show: showInfo.value,
  },
  {
    route: 'preferences',
    icon: appIcon('preferences'),
    label: $gettext('Preferences'),
    show: showPreferences.value,
  },
  {
    route: 'help',
    icon: appIcon('help'),
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

.menu-desktop {
  display: none;
  @media (min-width: 651px) {
    display: flex;
  }
}

.menu-mobile {
  display: block;
  @media (min-width: 651px) {
    display: none;
  }
}

.active-menu-btn {
  background: rgba(var(--q-primary-rgb), 0.1) !important;
  color: var(--q-primary) !important;
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
