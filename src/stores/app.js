import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { compareVersions } from 'compare-versions'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { useComputerStore } from './computer'
import { useDevicesStore } from './devices'
import { useExecutionsStore } from './executions'
import { useFiltersStore } from './filters'
import { usePackagesStore } from './packages'
import { usePreferencesStore } from './preferences'
import { useTagsStore } from './tags'
import { useUiStore } from './ui'

import {
  tokenAuth,
  publicApi,
  tokenApi,
  internalApi,
  checkTokenApi,
  minimumClientVersion,
} from 'config/app.conf'

require('dotenv').config()

export const useAppStore = defineStore('app', () => {
  const protocol = ref('')
  const host = ref('')
  const initialUrl = ref({
    baseDomain: '',
    public: '',
    token: '',
  })
  const token = ref('')
  const isTokenChecked = ref(false)
  const clientVersion = ref('')
  const serverVersion = ref('')
  const organization = ref('')
  const apps = ref([])
  const filteredApps = ref([])
  const user = ref({
    isPrivileged: false,
  })
  const status = ref('')
  const stopApp = ref(false)

  const getAppsPackages = computed(() => {
    let packages = []

    apps.value.forEach((value) => {
      if (value.packages_to_install.length > 0) {
        packages = packages.concat(value.packages_to_install)
      }
    })

    return packages
  })

  const userIsPrivileged = computed(() => user.value.isPrivileged)
  const appIsStopped = computed(() => stopApp.value)

  async function init() {
    const computerStore = useComputerStore()
    const devicesStore = useDevicesStore()
    const executionsStore = useExecutionsStore()
    const filtersStore = useFiltersStore()
    const packagesStore = usePackagesStore()
    const preferencesStore = usePreferencesStore()
    const tagsStore = useTagsStore()
    const uiStore = useUiStore()

    uiStore.loading()

    setStatus(gettext.$gettext('Preferences'))
    await preferencesStore.readPreferences()
    if (appIsStopped.value) return
    await clientInfo()
    checkClientVersion()
    if (appIsStopped.value) return
    await apiProtocol()
    await serverHost()

    setInitialUrl()

    setStatus(gettext.$gettext('Server'))
    await serverInfo()
    if (appIsStopped.value) return
    await getToken()
    await checkToken()
    if (appIsStopped.value) return
    if (!isTokenChecked.value) {
      await getToken()
    }

    setStatus(gettext.$gettext('Computer'))
    await computerStore.computerInfo()
    await computerStore.computerNetwork()
    await computerStore.computerId()
    if (!serverVersion.value.startsWith('4.'))
      await computerStore.computerLabel()
    await computerStore.computerData()
    await computerStore.computerAttribute()

    setStatus(gettext.$gettext('Apps'))
    await loadApps()

    setStatus(gettext.$gettext('Categories'))
    await filtersStore.setCategories()

    setStatus(gettext.$gettext('Packages'))
    await packagesStore.setAvailablePackages()
    await packagesStore.setInstalledPackages()

    await executionsStore.getExecutions()

    setStatus(gettext.$gettext('Devices'))
    await devicesStore.computerDevices()
    await devicesStore.getAvailableDevices()
    await devicesStore.getFeaturesDevices()

    setStatus(gettext.$gettext('Tags'))
    await tagsStore.getAvailableTags()
    await tagsStore.getAssignedTags()

    setStatus('')
    uiStore.loadingFinished()
  }

  async function clientInfo() {
    const uiStore = useUiStore()

    await api
      .get(`${internalApi}/preferences/client`)
      .then((response) => {
        clientVersion.value = response.data.version
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  function checkClientVersion() {
    if (compareVersions(clientVersion.value, minimumClientVersion) < 0) {
      setStatus(
        gettext.interpolate(
          gettext.$gettext(
            'This app requires at least Migasfree Client %{version}'
          ),
          {
            version: minimumClientVersion,
          }
        )
      )
      setStopApp()
    }
  }

  async function serverInfo() {
    const uiStore = useUiStore()

    await api
      .get(`${initialUrl.value.public}${publicApi.serverInfo}`)
      .then((response) => {
        serverVersion.value = response.data.version
        organization.value = response.data.organization
      })
      .catch((error) => {
        if (
          'response' in error &&
          'status' in error.response &&
          error.response.status === 405
        ) {
          api
            .post(`${initialUrl.value.public}${publicApi.serverInfo}`)
            .then((response) => {
              serverVersion.value = response.data.version
            })
            .catch((error) => {
              uiStore.notifyError(error)
            })
        } else uiStore.notifyError(error)
      })
  }

  async function getToken() {
    let response = await api.get(`${internalApi}/token`)
    if (!('data' in response) || !response.data.token) {
      response = await api
        .post(`${protocol.value}://${host.value}${tokenAuth.url}`, {
          username: process.env.MFP_USER || 'migasfree-play',
          password: process.env.MFP_PASSWORD || 'migasfree-play',
        })
        .catch((error) => {
          if (error.response.status === 400) {
            setStatus(
              gettext.$gettext(
                'Credentials are not valid. Review app settings.'
              )
            )
            setStopApp()
          }
        })
      if (response && response.data.token) {
        await api.post(`${internalApi}/token`, {
          token: response.data.token,
        })
      }
    }

    setToken(response ? response.data.token : '')
  }

  async function checkToken() {
    await api
      .get(`${protocol.value}://${host.value}${checkTokenApi.url}`, {
        headers: {
          Authorization: token.value,
        },
      })
      .then(() => {
        setTokenChecked(true)
      })
      .catch((error) => {
        if (!error.response) {
          setStatus(gettext.$gettext('There is no connection to the server'))
          setStopApp()
        } else {
          if (error.response.status === 403) {
            api.post(`${internalApi}/token`, {
              token: '',
            })
            setTokenChecked(false)
          }
        }
      })
  }

  async function checkUser({ user, password }) {
    const uiStore = useUiStore()

    await api
      .post(`${internalApi}/user/check`, {
        user,
        password,
      })
      .then((response) => {
        if (response.data.is_privileged) {
          user.value.isPrivileged = true
        } else {
          uiStore.notifyError(gettext.$gettext('User without privileges'))
        }
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function apiProtocol() {
    const uiStore = useUiStore()

    await api
      .get(
        `${internalApi}/preferences/protocol/?version=${clientVersion.value}`
      )
      .then((response) => {
        protocol.value = response.data
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function serverHost() {
    const uiStore = useUiStore()

    await api
      .get(`${internalApi}/preferences/server`)
      .then((response) => {
        host.value = response.data.server
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function loadApps() {
    const computerStore = useComputerStore()
    const uiStore = useUiStore()

    const { cid, project } = storeToRefs(computerStore)

    if (cid.value)
      await api
        .get(
          `${initialUrl.value.token}${tokenApi.apps}${cid.value}&page_size=${Number.MAX_SAFE_INTEGER}`,
          {
            headers: {
              Authorization: token.value,
            },
          }
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
        (app) => app.category.id == selectedCategory.value.id
      )
    if (searchApp.value) {
      const pattern = searchApp.value.toLowerCase()

      results = results.filter(
        (app) =>
          app.name.toLowerCase().includes(pattern) ||
          app.description.toLowerCase().includes(pattern)
      )
    }

    if (onlyInstalledApps.value) {
      const installedPackages = JSON.parse(JSON.stringify(installed.value))

      results = results.filter(
        (app) =>
          app.packages_to_install.length > 0 &&
          app.packages_to_install.filter((x) => !installedPackages.includes(x))
            .length === 0
      )
    }

    filteredApps.value = results
  }

  function setInitialUrl() {
    initialUrl.value.baseDomain = `${protocol.value}://${host.value}`
    initialUrl.value.public = `${initialUrl.value.baseDomain}${publicApi.prefix}`
    initialUrl.value.token = `${initialUrl.value.baseDomain}${tokenApi.prefix}`
  }

  function setToken(value) {
    token.value = `Token ${value}`
  }

  function setTokenChecked(value) {
    isTokenChecked.value = value
  }

  function setApps({ value, project }) {
    apps.value = []
    value.forEach((item) => {
      let filterPackages = item.packages_by_project.filter(
        (packages) => project === packages.project.name
      )
      if (filterPackages.length > 0) {
        item.packages_to_install = filterPackages[0].packages_to_install
        apps.value.push(item)
      }
    })
  }

  function setStatus(value) {
    status.value = value
  }

  function setStopApp() {
    stopApp.value = true
  }

  return {
    initialUrl,
    protocol,
    host,
    token,
    clientVersion,
    serverVersion,
    organization,
    filteredApps,
    status,
    getAppsPackages,
    userIsPrivileged,
    appIsStopped,
    init,
    checkUser,
    loadApps,
    filterApps,
    setStatus,
    setStopApp,
  }
})
