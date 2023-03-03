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
  <q-banner v-else class="bg-info text-black q-ma-md">
    <template #avatar>
      <q-icon name="mdi-information-outline" color="white" />
    </template>
    {{ $gettext('There are not items to show.') }}
  </q-banner>

  <Login :value="showLogin" @closed="showLogin = !showLogin" />
</template>

<script>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import AppFilter from 'components/AppFilter'
import AppDetail from 'components/AppDetail'
import Login from 'components/Login'
import Pagination from 'components/Pagination'

import { useAppStore } from 'src/stores/app'
import { useUiStore } from 'src/stores/ui'

import { resultsPerPage } from 'config/app.conf'

export default {
  name: 'Apps',
  components: {
    AppFilter,
    AppDetail,
    Login,
    Pagination,
  },
  setup() {
    const appStore = useAppStore()
    const uiStore = useUiStore()

    const { filteredApps } = storeToRefs(appStore)
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
