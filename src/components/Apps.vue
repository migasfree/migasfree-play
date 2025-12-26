<template>
  <AppFilter />

  <template v-if="filteredApps.length > 0">
    <div class="row">
      <AppDetail
        v-for="item in paginatedItems"
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

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import AppFilter from 'components/AppFilter'
import AppDetail from 'components/AppDetail'
import BannerInfo from 'components/BannerInfo'
import Login from 'components/Login'
import Pagination from 'components/Pagination'

import { useAppsStore } from 'src/stores/apps'
import { usePagination } from 'src/composables/usePagination'

const appsStore = useAppsStore()

const { filteredApps } = storeToRefs(appsStore)
const showLogin = ref(false)

const { paginatedItems, pageChanged } = usePagination(filteredApps)

const openLogin = () => {
  showLogin.value = true
}
</script>
