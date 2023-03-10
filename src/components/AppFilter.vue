<template>
  <div class="row">
    <div class="col">
      <q-card class="q-ma-sm" flat>
        <q-card-section>
          <p>
            <q-input
              v-model="searchApp"
              :placeholder="$gettext('Search in name or description')"
              clearable
              autofocus
              @update:model-value="appsStore.filterApps"
              ><template #prepend><q-icon name="mdi-magnify" /></template
            ></q-input>
          </p>

          <p>
            <q-select
              v-model="selectedCategory"
              :label="$gettext('Category')"
              :options="categories"
              option-value="id"
              option-label="name"
              clearable
              @update:model-value="appsStore.filterApps"
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
              @update:model-value="appsStore.filterApps"
            />
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { storeToRefs } from 'pinia'

import { useAppsStore } from 'src/stores/apps'
import { useFiltersStore } from 'src/stores/filters'

export default {
  name: 'AppFilter',
  setup() {
    const appsStore = useAppsStore()
    const filtersStore = useFiltersStore()

    const { searchApp, selectedCategory, categories, onlyInstalledApps } =
      storeToRefs(filtersStore)

    return {
      searchApp,
      selectedCategory,
      categories,
      onlyInstalledApps,
      appsStore,
    }
  },
}
</script>
