<template>
  <AppFilter />

  <div v-if="appsByFilter.length > 0" class="row">
    <AppDetail
      v-for="item in appsByFilter"
      :key="item.id"
      :icon="item.icon"
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
import { useStore } from 'vuex'

import AppFilter from 'components/AppFilter.vue'
import AppDetail from 'components/AppDetail.vue'
import Login from 'components/Login'

export default {
  name: 'Apps',
  components: {
    AppFilter,
    AppDetail,
    Login,
  },
  setup() {
    const store = useStore()

    const apps = ref([])
    const showLogin = ref(false)

    const installedPackages = computed(() =>
      JSON.parse(JSON.stringify(store.state.packages.installed))
    )

    const appsByFilter = computed(() => {
      let results = store.getters['app/getApps']

      const selectedCategory = store.getters['filters/selectedCategory']
      if (selectedCategory && selectedCategory.id > 0)
        results = results.filter(
          (app) =>
            app.category.id == store.getters['filters/selectedCategory'].id
        )
      if (store.getters['filters/searchApp']) {
        const pattern = store.getters['filters/searchApp'].toLowerCase()

        results = results.filter(
          (app) =>
            app.name.toLowerCase().includes(pattern) ||
            app.description.toLowerCase().includes(pattern)
        )
      }

      if (store.getters['filters/onlyInstalledApps'])
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

    return { apps, showLogin, appsByFilter, openLogin }
  },
}
</script>
