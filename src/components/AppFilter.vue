<template>
  <div class="row">
    <div class="col">
      <q-card class="q-ma-md" flat>
        <q-card-section>
          <p>
            <q-input
              v-model="filtersStore.searchApp"
              :placeholder="$gettext('Search in name or description')"
              clearable
              autofocus
              ><template #prepend><q-icon name="mdi-magnify" /></template
            ></q-input>
          </p>

          <p>
            <q-select
              v-model="filtersStore.selectedCategory"
              :label="$gettext('Category')"
              :options="filtersStore.getCategories"
              option-value="id"
              option-label="name"
              clearable
            />
          </p>

          <p>
            <q-toggle
              v-model="filtersStore.onlyInstalledApps"
              :label="
                filtersStore.onlyInstalledApps
                  ? $gettext('Installed Apps')
                  : $gettext('All Apps')
              "
              :false-value="false"
              :true-value="true"
            />
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { useFiltersStore } from 'src/stores/filters'

export default {
  name: 'AppFilter',
  setup() {
    const filtersStore = useFiltersStore()

    return { filtersStore }
  },
}
</script>
