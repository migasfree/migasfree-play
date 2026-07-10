<template>
  <div class="preferences-container">
    <q-card unelevated class="glass-card preferences-card">
      <q-card-section class="q-pa-lg">
        <div class="preferences-list">
          <!-- Language Row -->
          <div
            v-if="preferencesStore.showLanguage"
            class="preference-item q-pb-md"
          >
            <div
              class="row items-center justify-between no-wrap q-col-gutter-md"
            >
              <div class="preference-info col">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-icon
                    :name="appIcon('language')"
                    size="sm"
                    class="text-primary opacity-80"
                  />
                  <div class="text-subtitle1 text-weight-medium">
                    {{ $gettext('Language') }}
                  </div>
                </div>
                <div class="text-caption text-muted q-mt-xs">
                  {{ $gettext('Select your preferred interface language') }}
                </div>
              </div>
              <div class="preference-control col-auto min-w-200">
                <q-select
                  v-model="language"
                  dense
                  outlined
                  class="preference-select"
                  :options="availableLocales"
                  option-value="id"
                  option-label="name"
                  @update:model-value="setLanguage"
                />
              </div>
            </div>
          </div>

          <q-separator
            v-if="preferencesStore.showLanguage"
            class="q-my-md opacity-40"
          />

          <!-- Sync Details Row -->
          <div class="preference-item q-py-md">
            <div
              class="row items-center justify-between no-wrap q-col-gutter-md"
            >
              <div class="preference-info col">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-icon
                    :name="appIcon('show')"
                    size="sm"
                    class="text-primary opacity-80"
                  />
                  <div class="text-subtitle1 text-weight-medium">
                    {{ $gettext('Show synchronization details') }}
                  </div>
                </div>
                <div class="text-caption text-muted q-mt-xs">
                  {{
                    $gettext(
                      'Display detailed command logs and process outputs during execution',
                    )
                  }}
                </div>
              </div>
              <div class="preference-control col-auto">
                <q-toggle
                  v-model="preferencesStore.showSyncDetails"
                  dense
                  size="md"
                  @update:model-value="preferencesStore.savePreferences"
                />
              </div>
            </div>
          </div>

          <q-separator
            v-if="preferencesStore.showDarkMode"
            class="q-my-md opacity-40"
          />

          <!-- Theme Mode Row -->
          <div
            v-if="preferencesStore.showDarkMode"
            class="preference-item q-pt-md"
          >
            <div
              class="row items-center justify-between no-wrap q-col-gutter-md"
            >
              <div class="preference-info col">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-icon
                    :name="appIcon(preferencesStore.darkMode)"
                    size="sm"
                    class="text-primary opacity-80"
                  />
                  <div class="text-subtitle1 text-weight-medium">
                    {{ $gettext('Theme') }}
                  </div>
                </div>
                <div class="text-caption text-muted q-mt-xs">
                  {{
                    $gettext(
                      'Switch between light, dark, or system default appearance',
                    )
                  }}
                </div>
              </div>
              <div class="preference-control col-auto">
                <q-btn-toggle
                  v-model="preferencesStore.darkMode"
                  class="theme-toggle-group"
                  no-caps
                  rounded
                  unelevated
                  toggle-color="primary"
                  :options="themeOptions"
                  @update:model-value="preferencesStore.savePreferences"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'

import { usePreferencesStore } from 'src/stores/preferences'
import { appIcon } from 'src/composables/element'

const i18n = useGettext()
const { $gettext } = i18n
const preferencesStore = usePreferencesStore()

const language = ref(null)

const availableLocales = computed(() => {
  return Object.entries(i18n.available).map(([key, val]) => ({
    id: key,
    name: val,
  }))
})

const themeOptions = computed(() => [
  { value: 'system', icon: appIcon('system'), label: $gettext('System') },
  { value: 'light', icon: appIcon('light'), label: $gettext('Light') },
  { value: 'dark', icon: appIcon('dark'), label: $gettext('Dark') },
])

const setLanguage = () => {
  preferencesStore.setLanguage(language.value.id)
  preferencesStore.savePreferences()
}

onMounted(() => {
  language.value = availableLocales.value.find(
    (x) => x.id === preferencesStore.language,
  )
})
</script>

<style lang="scss" scoped>
.preferences-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.preferences-card {
  width: 100%;
  max-width: 760px;
  border-radius: var(--radius);
}

.min-w-200 {
  min-width: 200px;
}

.opacity-80 {
  opacity: 0.8;
}

// Capsule Segments style for the theme toggle
.theme-toggle-group {
  border: 1px solid var(--border);
  background-color: var(--neutral-100);
  padding: 3px;
  border-radius: 30px;

  :deep(.q-btn) {
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s ease;
    color: var(--text-muted);

    &:hover {
      color: var(--text-main);
      background: rgba(var(--brand-primary-rgb), 0.04);
    }
  }

  :deep(.q-btn--active) {
    background: var(--brand-primary) !important;
    color: var(--brand-on-primary) !important;
    box-shadow: 0 2px 8px rgba(var(--brand-primary-rgb), 0.2);
  }
}

.body--dark {
  .theme-toggle-group {
    background-color: rgba(255, 255, 255, 0.05);

    :deep(.q-btn) {
      color: var(--text-muted);

      &:hover {
        color: var(--text-main);
        background: rgba(255, 255, 255, 0.08);
      }
    }

    :deep(.q-btn--active) {
      background: var(--q-primary) !important; // yellow/gold in dark mode
      color: #0d0807 !important;
      box-shadow: 0 2px 8px rgba(var(--q-primary-rgb), 0.2);
    }
  }
}

// Adjust custom select style to be compact and matches system rows
.preference-select {
  :deep(.q-field__control) {
    border-radius: 8px !important;
    min-height: 40px !important;
    height: 40px !important;
  }

  :deep(.q-field__native) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    min-height: 40px !important;
    height: 40px !important;
  }

  :deep(.q-field__append) {
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 !important;
  }
}
</style>
