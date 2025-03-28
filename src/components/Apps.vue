<template>
  <AppFilter />

  <template v-if="filteredApps.length > 0">
    <div class="row">
      <AppDetail
        v-for="item in paginatedApps"
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

    <Pagination
      class="justify-center"
      :total="filteredApps.length"
      :page-changed="pageChanged"
    />
  </template>

  <BannerInfo v-else :message="$gettext('There are not items to show.')" />

  <Login :value="showLogin" @closed="showLogin = !showLogin" />
</template>

<script>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import AppFilter from 'components/AppFilter'
import AppDetail from 'components/AppDetail'
import BannerInfo from 'components/BannerInfo'
import Login from 'components/Login'
import Pagination from 'components/Pagination'

import { useAppsStore } from 'src/stores/apps'
import { useUiStore } from 'src/stores/ui'

import { resultsPerPage } from 'config/app.conf'

export default {
  name: 'Apps',
  components: {
    AppFilter,
    AppDetail,
    BannerInfo,
    Login,
    Pagination,
  },
  setup() {
    const appsStore = useAppsStore()
    const uiStore = useUiStore()

    const { filteredApps } = storeToRefs(appsStore)
    const showLogin = ref(false)
    const paginatedApps = ref(filteredApps.value.slice(0, resultsPerPage))

    const openLogin = () => {
      showLogin.value = true
    }

    const pageChanged = (currentPage = 1) => {
      const start = (currentPage - 1) * resultsPerPage
      const end = start + resultsPerPage

      paginatedApps.value = filteredApps.value.slice(start, end)

      setTimeout(() => {
        uiStore.scrollToElement(document.getElementById('main'))
      }, 250)
    }

    watch(filteredApps, () => {
      pageChanged()
    })

    return { filteredApps, paginatedApps, showLogin, openLogin, pageChanged }
  },
}
</script>
