import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useComputerStore } from './computer.js'
import { useFiltersStore } from './filters.js'
import { usePackagesStore } from './packages.js'
import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

import { tokenApi } from 'config/app.conf'

export const useAppsStore = defineStore('apps', () => {
  const apps = ref([])
  const filteredApps = ref([])

  const getAppsPackages = computed(() => {
    let packages = []

    apps.value.forEach((value) => {
      if (value.packages_to_install.length > 0) {
        packages = packages.concat(value.packages_to_install)
      }
    })

    return packages
  })

  const loadApps = async () => {
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { cid, project } = storeToRefs(computerStore)
    const { initialUrl, token } = storeToRefs(programStore)

    if (!cid.value) return

    try {
      const url = `${initialUrl.value.token}${tokenApi.apps}${cid.value}&page_size=${Number.MAX_SAFE_INTEGER}`
      const { data } = await api.get(url, {
        headers: { Authorization: token.value },
      })

      setApps({
        value: data.results,
        project: project.value,
      })
      filterApps()
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const filterApps = () => {
    const filtersStore = useFiltersStore()
    const packagesStore = usePackagesStore()

    const { searchApp, selectedCategory, onlyInstalledApps } =
      storeToRefs(filtersStore)
    const { installed } = storeToRefs(packagesStore)

    const installedSet = onlyInstalledApps.value
      ? new Set(installed.value)
      : null

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

      // Installed‑apps filter (if active)
      if (onlyInstalledApps.value) {
        // Must have at least one package to install
        if (app.packages_to_install.length === 0) return false

        // All required packages must be in the installed set
        const allInstalled = app.packages_to_install.every((pkg) =>
          installedSet.has(pkg),
        )
        if (!allInstalled) return false
      }

      return true
    })

    filteredApps.value = results
  }

  const setApps = ({ value, project }) => {
    apps.value = []
    value.forEach((item) => {
      const pkg = item.packages_by_project.find(
        (p) => p.project.name === project,
      )
      if (pkg) {
        item.packages_to_install = pkg.packages_to_install
        apps.value.push(item)
      }
    })
  }

  return {
    filteredApps,
    getAppsPackages,
    loadApps,
    filterApps,
  }
})
