import { defineStore } from 'pinia'

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
} from 'config/app.conf'

require('dotenv').config()

export const useAppStore = defineStore('app', {
  state: () => ({
    protocol: '',
    host: '',
    initialUrl: {
      baseDomain: '',
      public: '',
      token: '',
    },
    tokenValue: '',
    tokenChecked: false,
    serverVersion: '',
    organization: '',
    apps: [],
    user: {
      isPrivileged: false,
    },
    status: '',
    stopApp: false,
  }),
  getters: {
    getAppsPackages: (state) => {
      let packages = []

      state.apps.forEach((value) => {
        if (value.packages_to_install.length > 0) {
          packages = packages.concat(value.packages_to_install)
        }
      })

      return packages
    },
    getApps: (state) => state.apps,
    userIsPrivileged: (state) => state.user.isPrivileged,
    getInitialUrl: (state) => state.initialUrl,
    getProtocol: (state) => state.protocol,
    getHost: (state) => state.host,
    getOrganization: (state) => state.organization,
    getStatus: (state) => state.status,
    appIsStopped: (state) => state.stopApp,
    token: (state) => state.tokenValue,
  },
  actions: {
    async init() {
      const computerStore = useComputerStore()
      const devicesStore = useDevicesStore()
      const executionsStore = useExecutionsStore()
      const filtersStore = useFiltersStore()
      const packagesStore = usePackagesStore()
      const preferencesStore = usePreferencesStore()
      const tagsStore = useTagsStore()
      const uiStore = useUiStore()

      uiStore.loading()

      this.setStatus(gettext.$gettext('Preferences'))
      await preferencesStore.readPreferences()
      if (this.appIsStopped) return
      await this.apiProtocol()
      await this.serverHost()

      this.setInitialUrl()

      this.setStatus(gettext.$gettext('Server'))
      await this.serverInfo()
      if (this.appIsStopped) return
      await this.getToken()
      await this.checkToken()
      if (this.appIsStopped) return
      if (!this.tokenChecked) {
        await this.getToken()
      }

      this.setStatus(gettext.$gettext('Computer'))
      await computerStore.computerInfo()
      await computerStore.computerNetwork()
      await computerStore.computerId()
      await computerStore.computerData()
      await computerStore.computerAttribute()

      this.setStatus(gettext.$gettext('Apps'))
      await this.loadApps()

      this.setStatus(gettext.$gettext('Categories'))
      await filtersStore.setCategories()

      this.setStatus(gettext.$gettext('Packages'))
      await packagesStore.setAvailablePackages()
      await packagesStore.setInstalledPackages()

      await executionsStore.getExecutions()

      this.setStatus(gettext.$gettext('Devices'))
      await devicesStore.computerDevices()
      await devicesStore.getAvailableDevices()
      await devicesStore.getFeaturesDevices()

      this.setStatus(gettext.$gettext('Tags'))
      await tagsStore.getAvailableTags()
      await tagsStore.getAssignedTags()

      this.setStatus('')
      uiStore.loadingFinished()
    },

    async serverInfo() {
      await api
        .get(`${this.initialUrl.public}${publicApi.serverInfo}`)
        .then((response) => {
          this.setServerVersion(response.data.version)
          this.setOrganization(response.data.organization)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async getToken() {
      let response = await api.get(`${internalApi}/token`)
      if (!('data' in response) || !response.data.token) {
        response = await api
          .post(`${this.protocol}://${this.host}${tokenAuth.url}`, {
            username: process.env.MIGASFREE_USER || 'migasfree-play',
            password: process.env.MIGASFREE_PASSWORD || 'migasfree-play',
          })
          .catch((error) => {
            if (error.response.status === 400) {
              this.setStatus(
                gettext.$gettext(
                  'Credentials are not valid. Review app settings.'
                )
              )
              this.setStopApp()
            }
          })
        if (response && response.data.token) {
          await api.post(`${internalApi}/token`, {
            token: response.data.token,
          })
        }
      }

      this.setToken(response ? response.data.token : '')
    },

    async checkToken() {
      await api
        .get(`${this.protocol}://${this.host}${checkTokenApi.url}`, {
          headers: {
            Authorization: this.tokenValue,
          },
        })
        .then(() => {
          this.setTokenChecked(true)
        })
        .catch((error) => {
          if (!error.response) {
            this.setStatus(
              gettext.$gettext('There is no connection to the server')
            )
            this.setStopApp()
          } else {
            if (error.response.status === 403) {
              api.post(`${internalApi}/token`, {
                token: '',
              })
              this.setTokenChecked(false)
            }
          }
        })
    },

    async checkUser({ user, password }) {
      const uiStore = useUiStore()

      await api
        .post(`${internalApi}/user/check`, {
          user,
          password,
        })
        .then((response) => {
          if (response.data.is_privileged) {
            this.privilegedUser()
          } else {
            uiStore.notifyError(gettext.$gettext('User without privileges'))
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async apiProtocol() {
      const uiStore = useUiStore()

      await api
        .get(`${internalApi}/preferences/protocol`)
        .then((response) => {
          this.setApiProcotol(response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async serverHost() {
      const uiStore = useUiStore()

      await api
        .get(`${internalApi}/preferences/server`)
        .then((response) => {
          this.setServerHost(response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async loadApps() {
      const computerStore = useComputerStore()
      const uiStore = useUiStore()
      const computer = computerStore.getComputer

      if (computer.cid)
        await api
          .get(
            `${this.initialUrl.token}${tokenApi.apps}${computer.cid}&page_size=${Number.MAX_SAFE_INTEGER}`,
            {
              headers: {
                Authorization: this.tokenValue,
              },
            }
          )
          .then((response) => {
            this.setApps({
              value: response.data.results,
              project: computer.project,
            })
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    },

    setInitialUrl() {
      this.initialUrl.baseDomain = `${this.protocol}://${this.host}`
      this.initialUrl.public = `${this.initialUrl.baseDomain}${publicApi.prefix}`
      this.initialUrl.token = `${this.initialUrl.baseDomain}${tokenApi.prefix}`
    },

    setToken(value) {
      this.tokenValue = `Token ${value}`
    },

    setTokenChecked(value) {
      this.tokenChecked = value
    },

    setServerVersion(value) {
      this.serverVersion = value
    },

    setOrganization(value) {
      this.organization = value
    },

    setServerHost(value) {
      this.host = value.server
    },

    setApiProcotol(value) {
      this.protocol = value
    },

    setApps({ value, project }) {
      this.apps = []
      value.forEach((item) => {
        let filterPackages = item.packages_by_project.filter(
          (packages) => project === packages.project.name
        )
        if (filterPackages.length > 0) {
          item.packages_to_install = filterPackages[0].packages_to_install
          this.apps.push(item)
        }
      })
    },

    privilegedUser() {
      this.user.isPrivileged = true
    },

    setStatus(value) {
      this.status = value
    },

    setStopApp() {
      this.stopApp = true
    },
  },
})
