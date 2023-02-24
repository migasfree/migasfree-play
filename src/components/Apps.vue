<template>
  <AppFilter />

  <div v-if="appsByFilter.length > 0" class="row">
    <AppDetail
      v-for="item in appsByFilter"
      :key="item.id"
      :icon="item.icon || ''"
      :name="item.name"
      :category="item.category.name"
      :score="item.score"
      :description="item.description"
      :packages="item.packages_to_install"
      :level="item.level.id"
      @openlogin="openLogin"
    />
  </div>
  <q-banner v-else class="bg-info text-black q-ma-md">
    <template #avatar>
      <q-icon name="mdi-information-outline" color="white" />
    </template>
    {{ $gettext('There are not items to show.') }}
  </q-banner>

  <Login :value="showLogin" @closed="showLogin = !showLogin" />
</template>

<script>
import { ref, computed } from 'vue'

import AppFilter from 'components/AppFilter.vue'
import AppDetail from 'components/AppDetail.vue'
import Login from 'components/Login'

import { useAppStore } from 'src/stores/app'
import { useFiltersStore } from 'src/stores/filters'
import { usePackagesStore } from 'src/stores/packages'

export default {
  name: 'Apps',
  components: {
    AppFilter,
    AppDetail,
    Login,
  },
  setup() {
    const appStore = useAppStore()
    const filtersStore = useFiltersStore()
    const packagesStore = usePackagesStore()

    const showLogin = ref(false)

    const installedPackages = computed(() =>
      JSON.parse(JSON.stringify(packagesStore.installed))
    )

    const appsByFilter = computed(() => {
      let results = appStore.getApps

      const selectedCategory = filtersStore.selectedCategory
      if (selectedCategory && selectedCategory.id > 0)
        results = results.filter(
          (app) => app.category.id == selectedCategory.id
        )
      if (filtersStore.searchApp) {
        const pattern = filtersStore.searchApp.toLowerCase()

        results = results.filter(
          (app) =>
            app.name.toLowerCase().includes(pattern) ||
            app.description.toLowerCase().includes(pattern)
        )
      }

      if (filtersStore.onlyInstalledApps)
        results = results.filter(
          (app) =>
            app.packages_to_install.length > 0 &&
            app.packages_to_install.filter(
              (x) => !installedPackages.value.includes(x)
            ).length === 0
        )

      return results
    })

    const openLogin = () => {
      showLogin.value = true
    }

    return { showLogin, appsByFilter, openLogin }
  },
}
</script>
