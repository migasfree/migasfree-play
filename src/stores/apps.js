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

  async function loadApps() {
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { cid, project } = storeToRefs(computerStore)
    const { initialUrl, token } = storeToRefs(programStore)

    if (cid.value)
      await api
        .get(
          `${initialUrl.value.token}${tokenApi.apps}${cid.value}&page_size=${Number.MAX_SAFE_INTEGER}`,
          {
            headers: {
              Authorization: token.value,
            },
          },
        )
        .then((response) => {
          setApps({
            value: response.data.results,
            project: project.value,
          })
          filterApps()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  function filterApps() {
    const filtersStore = useFiltersStore()
    const packagesStore = usePackagesStore()

    let results = apps.value

    const { searchApp, selectedCategory, onlyInstalledApps } =
      storeToRefs(filtersStore)
    const { installed } = storeToRefs(packagesStore)
    if (selectedCategory.value && selectedCategory.value.id > 0)
      results = results.filter(
        (app) => app.category.id == selectedCategory.value.id,
      )
    if (searchApp.value) {
      const pattern = searchApp.value.toLowerCase()

      results = results.filter(
        (app) =>
          app.name.toLowerCase().includes(pattern) ||
          app.description.toLowerCase().includes(pattern),
      )
    }

    if (onlyInstalledApps.value) {
      const installedPackages = JSON.parse(JSON.stringify(installed.value))

      results = results.filter(
        (app) =>
          app.packages_to_install.length > 0 &&
          app.packages_to_install.filter((x) => !installedPackages.includes(x))
            .length === 0,
      )
    }

    filteredApps.value = results
  }

  function setApps({ value, project }) {
    apps.value = []
    value.forEach((item) => {
      let filterPackages = item.packages_by_project.filter(
        (packages) => project === packages.project.name,
      )
      if (filterPackages.length > 0) {
        item.packages_to_install = filterPackages[0].packages_to_install
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
