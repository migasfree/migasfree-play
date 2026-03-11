<template>
  <FilterCard>
    <div class="row q-col-gutter-lg items-center">
      <!-- Language Selection -->
      <div v-if="preferencesStore.showLanguage" class="col-12 col-md-4">
        <q-select
          v-model="language"
          dense
          filled
          class="preference-input"
          :label="$gettext('Language')"
          :options="availableLocales"
          option-value="id"
          option-label="name"
          @update:model-value="setLanguage"
        >
          <template #prepend>
            <q-icon name="mdi-translate" size="xs" />
          </template>
        </q-select>
      </div>

      <!-- Sync Details Toggle -->
      <div class="col-12 col-sm-6 col-md-4 flex items-center">
        <q-toggle
          v-model="preferencesStore.showSyncDetails"
          dense
          class="preference-toggle"
          :label="$gettext('Show synchronization details')"
          checked-icon="mdi-eye"
          unchecked-icon="mdi-eye-off"
          size="md"
          :false-value="false"
          :true-value="true"
          @update:model-value="preferencesStore.savePreferences"
        />
      </div>

      <!-- Dark Mode Toggle -->
      <div
        v-if="preferencesStore.showDarkMode"
        class="col-12 col-sm-6 col-md-4 flex items-center"
      >
        <q-toggle
          v-model="preferencesStore.darkMode"
          dense
          class="preference-toggle"
          :label="$gettext('Dark mode')"
          checked-icon="mdi-weather-night"
          unchecked-icon="mdi-weather-sunny"
          size="md"
          :false-value="false"
          :true-value="true"
          @update:model-value="preferencesStore.savePreferences"
        />
      </div>
    </div>
  </FilterCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'

import FilterCard from 'components/FilterCard'

import { usePreferencesStore } from 'src/stores/preferences'

const i18n = useGettext()
const preferencesStore = usePreferencesStore()

const language = ref(null)

const availableLocales = computed(() => {
  return Object.entries(i18n.available).map(([key, val]) => ({
    id: key,
    name: val,
  }))
})

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
