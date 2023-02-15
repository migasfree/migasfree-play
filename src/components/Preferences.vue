<template>
  <div class="row">
    <div class="col">
      <q-card class="q-ma-md" flat>
        <q-card-section>
          <p>
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
              v-model="showSyncDetails"
              :label="
                showSyncDetails
                  ? $gettext('Show details when synchronizing')
                  : $gettext('Not show details when synchronizing')
              "
              :false-value="false"
              :true-value="true"
              @update:model-value="setShowSyncDetails"
            />
          </p>

          <p v-if="showDarkMode">
            <q-toggle
              v-model="darkMode"
              :label="
                darkMode
                  ? $gettext('Switch to Light mode')
                  : $gettext('Switch to Dark mode')
              "
              :false-value="false"
              :true-value="true"
              @update:model-value="setDarkMode"
            />
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'

import { usePreferencesStore } from 'src/stores/preferences'

export default {
  name: 'Preferences',
  setup() {
    const i18n = useGettext()
    const preferencesStore = usePreferencesStore()

    const language = ref(null)
    const showSyncDetails = ref(false)
    const darkMode = ref(false)
    const showDarkMode = ref(false)

    const availableLocales = computed(() => {
      let items = []

      Object.entries(i18n.available).map(([key, val]) => {
        items.push({
          id: key,
          name: val,
        })
      })

      return items
    })

    const setLanguage = () => {
      preferencesStore.setLanguage(language.value.id)
      preferencesStore.savePreferences()
      i18n.current = language.value.id
    }

    const setShowSyncDetails = () => {
      preferencesStore.setShowSyncDetails(showSyncDetails.value)
      preferencesStore.savePreferences()
    }

    const setDarkMode = () => {
      preferencesStore.setDarkMode(darkMode.value)
      preferencesStore.savePreferences()
    }

    onMounted(() => {
      language.value = availableLocales.value.find(
        (x) => x.id === preferencesStore.language
      )
      showSyncDetails.value = preferencesStore.showSyncDetails
      darkMode.value = preferencesStore.darkMode
      showDarkMode.value = preferencesStore.showDarkMode
    })

    return {
      language,
      showSyncDetails,
      darkMode,
      showDarkMode,
      availableLocales,
      setLanguage,
      setShowSyncDetails,
      setDarkMode,
    }
  },
}
</script>
