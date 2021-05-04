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
              @input="setLanguage"
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
              @input="setShowSyncDetails"
            />
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'Preferences',
  data() {
    return {
      language: null,
      showSyncDetails: false
    }
  },
  computed: {
    availableLocales() {
      let items = []

      Object.entries(this.$language.available).map(([key, val]) => {
        items.push({
          id: key,
          name: val
        })
      })

      return items
    }
  },
  mounted() {
    this.language = this.availableLocales.find(
      (x) => x.id === this.$store.state.preferences.language
    )
    this.showSyncDetails = this.$store.state.preferences.showSyncDetails
  },
  methods: {
    setLanguage() {
      this.$store.commit('preferences/setLanguage', this.language.id)
      this.$store.dispatch('preferences/savePreferences')
      Vue.config.language = this.language.id
    },
    setShowSyncDetails() {
      this.$store.commit('preferences/setShowSyncDetails', this.showSyncDetails)
      this.$store.dispatch('preferences/savePreferences')
    }
  }
}
</script>
