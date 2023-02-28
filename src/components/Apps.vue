<template>
  <AppFilter />

  <div v-if="filteredApps.length > 0" class="row">
    <AppDetail
      v-for="item in filteredApps"
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
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import AppFilter from 'components/AppFilter.vue'
import AppDetail from 'components/AppDetail.vue'
import Login from 'components/Login'

import { useAppStore } from 'src/stores/app'

export default {
  name: 'Apps',
  components: {
    AppFilter,
    AppDetail,
    Login,
  },
  setup() {
    const appStore = useAppStore()

    const { filteredApps } = storeToRefs(appStore)
    const showLogin = ref(false)

    const openLogin = () => {
      showLogin.value = true
    }

    return { filteredApps, showLogin, openLogin }
  },
}
</script>
