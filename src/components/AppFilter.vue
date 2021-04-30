<template>
  <div class="row">
    <div class="col">
      <q-card class="q-ma-md" flat>
        <q-card-section>
          <p>
            <q-input
              v-model="searchApp"
              :placeholder="$gettext('Search in name or description')"
              clearable
              autofocus
              @input="setSearchApp"
              ><template #prepend><q-icon name="mdi-magnify"/></template
            ></q-input>
          </p>

          <p>
            <q-select
              v-model="category"
              :label="$gettext('Category')"
              :options="categories"
              option-value="id"
              option-label="name"
              clearable
              @input="setCategory"
            />
          </p>

          <p>
            <q-toggle
              v-model="onlyInstalledApps"
              :label="
                onlyInstalledApps
                  ? $gettext('Installed Apps')
                  : $gettext('All Apps')
              "
              :false-value="false"
              :true-value="true"
              @input="setOnlyInstalledApps"
            />
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppFilter',
  data() {
    return {
      category: null,
      searchApp: '',
      onlyInstalledApps: false
    }
  },
  computed: {
    selectedCategory() {
      return this.$store.getters['filters/selectedCategory']
    },

    categories() {
      return this.$store.getters['filters/getCategories']
    }
  },
  mounted() {
    this.category = this.$store.getters['filters/selectedCategory']
    this.searchApp = this.$store.getters['filters/searchApp']
    this.onlyInstalledApps = this.$store.getters['filters/onlyInstalledApps']
  },
  methods: {
    setCategory() {
      this.$store.commit('filters/setSelectedCategory', this.category)
    },

    setSearchApp() {
      this.$store.commit('filters/setSearchApp', this.searchApp)
    },

    setOnlyInstalledApps() {
      this.$store.commit('filters/setOnlyInstalledApps', this.onlyInstalledApps)
    }
  }
}
</script>
