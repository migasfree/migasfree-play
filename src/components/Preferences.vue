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
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useGettext } from 'vue3-gettext'

export default {
  name: 'Preferences',
  setup() {
    const store = useStore()
    const i18n = useGettext()

    const language = ref(null)
    const showSyncDetails = ref(false)

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
      store.commit('preferences/setLanguage', language.value.id)
      store.dispatch('preferences/savePreferences')
      i18n.current = language.value.id
    }

    const setShowSyncDetails = () => {
      store.commit('preferences/setShowSyncDetails', showSyncDetails.value)
      store.dispatch('preferences/savePreferences')
    }

    onMounted(() => {
      language.value = availableLocales.value.find(
        (x) => x.id === store.state.preferences.language
      )
      showSyncDetails.value = store.state.preferences.showSyncDetails
    })

    return {
      language,
      showSyncDetails,
      availableLocales,
      setLanguage,
      setShowSyncDetails,
    }
  },
}
</script>
