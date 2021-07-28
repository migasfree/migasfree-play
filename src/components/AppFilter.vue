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
import { useStore } from 'vuex'

export default {
  name: 'AppFilter',
  setup() {
    const store = useStore()

    const category = ref(null)
    const searchApp = ref('')
    const onlyInstalledApps = ref(false)

    const selectedCategory = computed(
      () => store.getters['filters/selectedCategory']
    )

    const categories = computed(() => store.getters['filters/getCategories'])

    const setCategory = () => {
      store.commit('filters/setSelectedCategory', category.value)
    }

    const setSearchApp = () => {
      store.commit('filters/setSearchApp', searchApp.value)
    }

    const setOnlyInstalledApps = () => {
      store.commit('filters/setOnlyInstalledApps', onlyInstalledApps.value)
    }

    onMounted(() => {
      category.value = store.getters['filters/selectedCategory']
      searchApp.value = store.getters['filters/searchApp']
      onlyInstalledApps.value = store.getters['filters/onlyInstalledApps']
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
