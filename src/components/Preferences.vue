<template>
  <FilterCard>
    <p v-if="preferencesStore.showLanguage">
      <q-select
        v-model="language"
        :label="$gettext('Language')"
        :options="availableLocales"
        option-value="id"
        option-label="name"
        @update:model-value="setLanguage"
      />
    </p>

    <p>
      <q-toggle
        v-model="preferencesStore.showSyncDetails"
        :label="
          preferencesStore.showSyncDetails
            ? $gettext('Not show details when synchronizing')
            : $gettext('Show details when synchronizing')
        "
        checked-icon="mdi-eye"
        unchecked-icon="mdi-eye-off"
        size="xl"
        :false-value="false"
        :true-value="true"
        @update:model-value="preferencesStore.savePreferences"
      />
    </p>

    <p v-if="preferencesStore.showDarkMode">
      <q-toggle
        v-model="preferencesStore.darkMode"
        :label="
          preferencesStore.darkMode
            ? $gettext('Switch to Light mode')
            : $gettext('Switch to Dark mode')
        "
        checked-icon="nights_stay"
        unchecked-icon="wb_sunny"
        size="xl"
        :false-value="false"
        :true-value="true"
        @update:model-value="preferencesStore.savePreferences"
      />
    </p>
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
