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
              @update:model-value="setSearchApp"
              ><template #prepend><q-icon name="mdi-magnify" /></template
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
              @update:model-value="setCategory"
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
              @update:model-value="setOnlyInstalledApps"
            />
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

import { useFiltersStore } from 'src/stores/filters'

export default {
  name: 'AppFilter',
  setup() {
    const filtersStore = useFiltersStore()

    const category = ref(null)
    const searchApp = ref('')
    const onlyInstalledApps = ref(false)

    const selectedCategory = computed(
      () => filtersStore.selectedCategory
    )

    const categories = computed(() => filtersStore.getCategories)

    const setCategory = () => {
      filtersStore.setSelectedCategory(category.value)
    }

    const setSearchApp = () => {
      filtersStore.setSearchApp(searchApp.value)
    }

    const setOnlyInstalledApps = () => {
      filtersStore.setOnlyInstalledApps(onlyInstalledApps.value)
    }

    onMounted(() => {
      category.value = filtersStore.selectedCategory
      searchApp.value = filtersStore.searchApp
      onlyInstalledApps.value = filtersStore.onlyInstalledApps
    })

    return {
      category,
      searchApp,
      onlyInstalledApps,
      selectedCategory,
      categories,
      setCategory,
      setSearchApp,
      setOnlyInstalledApps,
    }
  },
}
</script>
