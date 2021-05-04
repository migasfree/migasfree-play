<template>
  <div>
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

    <Login v-model="showLogin" @canceled="showLogin = !showLogin" />
  </div>
</template>

<script>
import AppFilter from 'components/AppFilter.vue'
import AppDetail from 'components/AppDetail.vue'
import Login from 'components/Login'

export default {
  name: 'Apps',
  components: {
    AppFilter,
    AppDetail,
    Login
  },
  data() {
    return {
      apps: [],
      showLogin: false
    }
  },
  computed: {
    appsByFilter() {
      let results = this.$store.getters['app/getApps']

      const selectedCategory = this.$store.getters['filters/selectedCategory']
      if (selectedCategory && selectedCategory.id > 0)
        results = results.filter(
          (app) =>
            app.category.id ==
            this.$store.getters['filters/selectedCategory'].id
        )
      if (this.$store.getters['filters/searchApp'])
        results = results.filter(
          (app) =>
            app.name
              .toLowerCase()
              .includes(this.$store.getters['filters/searchApp']) ||
            app.description
              .toLowerCase()
              .includes(this.$store.getters['filters/searchApp'])
        )

      if (this.$store.getters['filters/onlyInstalledApps'])
        results = results.filter(
          (app) =>
            app.packages_to_install.length > 0 &&
            app.packages_to_install.filter(
              (x) => !this.$store.state.packages.installed.includes(x)
            ).length === 0
        )

      return results
    }
  },
  methods: {
    openLogin() {
      this.showLogin = true
    }
  }
}
</script>
