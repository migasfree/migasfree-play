import { ref, computed, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useComputerStore } from './computer.js'
import { useFiltersStore } from './filters.js'
import { useAuthStore } from './auth.js'
import { usePackagesStore } from './packages.js'
import { useServerStore } from './server.js'
import { useUiStore } from './ui.js'

import { tokenApi } from 'config/app.conf'

export const useAppsStore = defineStore('apps', () => {
  const apps = ref([])
  const filteredApps = ref([])
  const hasLoaded = ref(false)

  const getAppsPackages = computed(() => {
    return apps.value.flatMap((app) => app.packages_to_install || [])
  })

  const loadApps = async () => {
    const authStore = useAuthStore()
    const computerStore = useComputerStore()
    const serverStore = useServerStore()
    const uiStore = useUiStore()

    const { cid, project } = storeToRefs(computerStore)
    const { initialUrl, isLegacyClient } = storeToRefs(serverStore)
    const { token } = storeToRefs(authStore)

    if (!cid.value) return

    try {
      let data
      if (isLegacyClient.value) {
        const url = `${initialUrl.value.token}${tokenApi.apps}${cid.value}&page_size=${Number.MAX_SAFE_INTEGER}`
        const response = await api.get(url, {
          headers: { Authorization: token.value },
        })
        data = response.data.results || response.data
      } else {
        data = await window.electronAPI.apps.getAvailable()
      }

      setApps({
        value: data,
        project: project.value,
      })
      filterApps()
      hasLoaded.value = true
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  // Returns the exclusive status of an app based on the priority hierarchy:
  // installed → unavailable → privileged → not_installed
  const getAppStatus = (app, packagesStore, userIsPrivileged) => {
    const pkgs = app.packages_to_install

    if (
      pkgs.length > 0 &&
      pkgs.every((pkg) => packagesStore.installedSet.has(pkg))
    ) {
      return 'installed'
    }

    if (!pkgs.every((pkg) => packagesStore.availableSet.has(pkg))) {
      return 'unavailable'
    }

    if (app.level?.id === 'A' && !userIsPrivileged) {
      return 'privileged'
    }

    return 'not_installed'
  }

  // Returns the set of status keys that are currently present in the app list.
  // The component uses this to build the translated options for the status select.
  const presentStatuses = computed(() => {
    const packagesStore = usePackagesStore()
    const authStore = useAuthStore()
    const { userIsPrivileged } = storeToRefs(authStore)

    const present = new Set()
    apps.value.forEach((app) => {
      present.add(getAppStatus(app, packagesStore, userIsPrivileged.value))
    })
    return present
  })

  const filterApps = () => {
    const filtersStore = useFiltersStore()
    const packagesStore = usePackagesStore()
    const authStore = useAuthStore()

    const { searchApp, selectedCategory, appStatusFilter } =
      storeToRefs(filtersStore)
    const { userIsPrivileged } = storeToRefs(authStore)

    const pattern = searchApp.value?.toLowerCase()
    const categoryId = selectedCategory.value?.id

    const results = apps.value.filter((app) => {
      // Category filter (if active)
      if (categoryId && categoryId > 0 && app.category.id !== categoryId) {
        return false
      }

      // Search filter (if active)
      if (pattern) {
        const nameMatch = app.name.toLowerCase().includes(pattern)
        const descMatch = app.description.toLowerCase().includes(pattern)
        if (!nameMatch && !descMatch) return false
      }

      // Status filter (if active)
      if (appStatusFilter.value !== null) {
        if (
          getAppStatus(app, packagesStore, userIsPrivileged.value) !==
          appStatusFilter.value
        ) {
          return false
        }
      }

      return true
    })

    filteredApps.value = results
  }

  const setApps = ({ value, project }) => {
    const results = []
    value.forEach((item) => {
      const pkg = item.packages_by_project.find(
        (p) => p.project.name === project,
      )
      if (pkg) {
        item.packages_to_install = pkg.packages_to_install
        results.push(item)
      }
    })
    apps.value = results
  }

  watch(
    () => useAuthStore().userIsPrivileged,
    () => {
      filterApps()
    },
  )

  return {
    apps,
    filteredApps,
    getAppsPackages,
    loadApps,
    filterApps,
    getAppStatus,
    presentStatuses,
    hasLoaded,
  }
})
