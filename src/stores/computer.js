import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'
import { useServerStore } from './server.js'

import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

import { tokenApi } from 'config/app.conf'

export const useComputerStore = defineStore('computer', () => {
  const name = ref('')
  const uuid = ref('')
  const cid = ref(0)
  const project = ref('')
  const user = ref('')
  const link = ref('')
  const ip = ref('')
  const mask = ref('')
  const network = ref('')
  const helpdesk = ref('')
  const data = ref({})
  const attribute = ref(0)
  const platform = ref('')

  const uiStore = useUiStore()
  const serverStore = useServerStore()
  const programStore = useProgramStore()
  const tokenGet = async (url) => {
    return await api.get(url, {
      headers: { Authorization: programStore.token },
    })
  }

  const computerInfo = async () => {
    try {
      const data =
        serverStore.systemInfo ||
        (await window.electronAPI.preferences.getServerInfo())

      uuid.value = data.uuid
      name.value = data.computer_name
      user.value = data.user
      project.value = data.project
      platform.value = await window.electronAPI.getPlatform()
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerNetwork = async () => {
    if (!isRegistered.value) return

    try {
      const data = await window.electronAPI.computer.getNetwork()
      mask.value = data.mask
      network.value = data.network
      ip.value = data.ip_address
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerId = async () => {
    const url = `${programStore.protocol}://${programStore.host}/get_computer_info/?uuid=${uuid.value}`

    try {
      if (programStore.isLegacyClient) {
        const { data } = await api.get(url)
        cid.value = data.id
        helpdesk.value = data.helpdesk
      } else {
        const fetchedId = await window.electronAPI.computer.getId()
        cid.value = fetchedId || '0'
      }

      setComputerLink()
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerLabel = async () => {
    if (!isRegistered.value) return

    try {
      const { data } = await tokenGet(
        `${programStore.initialUrl.token}${tokenApi.computer}${cid.value}/label/`,
      )
      helpdesk.value = data.helpdesk
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerData = async () => {
    if (!isRegistered.value) return

    try {
      const response = await tokenGet(
        `${programStore.initialUrl.token}${tokenApi.computer}${cid.value}/`,
      )
      data.value = response.data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerAttribute = async () => {
    if (!isRegistered.value) return

    try {
      const { data } = await tokenGet(
        `${programStore.initialUrl.token}${tokenApi.cidAttribute}${cid.value}`,
      )

      if (data.count === 1) attribute.value = data.results[0].id
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setComputerLink = () => {
    link.value = programStore.isLegacyServer
      ? `${programStore.protocol}://${programStore.host}/admin/server/computer/${cid.value}/change/`
      : `${programStore.protocol}://${programStore.host}/computers/results/${cid.value}/`
  }

  const registerComputer = async ({ user, password }) => {
    try {
      const result = await window.electronAPI.computer.register(
        user,
        password,
        programStore.clientVersion,
      )

      if (result === 0 || result === '0') {
        uiStore.notifyError(
          gettext.$gettext('There was a problem with registration'),
        )
        return
      }

      uiStore.notifySuccess(gettext.$gettext('Registered Computer!'))
      await computerId()
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const isRegistered = computed(
    () => !!cid.value && cid.value !== '0' && cid.value !== 0,
  )

  return {
    name,
    uuid,
    cid,
    isRegistered,
    project,
    user,
    link,
    ip,
    mask,
    network,
    helpdesk,
    data,
    attribute,
    platform,
    computerInfo,
    computerNetwork,
    computerId,
    computerLabel,
    computerData,
    computerAttribute,
    registerComputer,
  }
})
