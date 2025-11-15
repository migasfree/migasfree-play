import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

import { internalApi, tokenApi } from 'config/app.conf'

export const useComputerStore = defineStore('computer', () => {
  const name = ref('')
  const uuid = ref('')
  const cid = ref(0)
  const project = ref('')
  const user = ref('')
  const link = ref('')
  const mask = ref('')
  const network = ref('')
  const helpdesk = ref('')
  const data = ref({})
  const attribute = ref(0)

  const uiStore = useUiStore()
  const programStore = useProgramStore()
  const { clientVersion, protocol, host, initialUrl, token, serverVersion } =
    storeToRefs(programStore)

  const tokenGet = async (url) => {
    return await api.get(url, { headers: { Authorization: token.value } })
  }

  const computerInfo = async () => {
    try {
      const { data } = await api.get(`${internalApi}/preferences/server`)

      uuid.value = data.uuid
      name.value = data.computer_name
      user.value = data.user
      project.value = data.project
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerNetwork = async () => {
    try {
      const { data } = await api.get(`${internalApi}/computer/network`)
      mask.value = data.mask
      network.value = data.network
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerId = async () => {
    const url = clientVersion.value.startsWith('4.')
      ? `${protocol.value}://${host.value}/get_computer_info/?uuid=${uuid.value}`
      : `${internalApi}/computer/id`

    try {
      const { data } = await api.get(url)

      if (clientVersion.value.startsWith('4.')) {
        cid.value = data.id
        helpdesk.value = data.helpdesk
      } else {
        cid.value = data
      }

      setComputerLink()
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerLabel = async () => {
    if (!cid.value) return

    try {
      const { data } = await tokenGet(
        `${initialUrl.value.token}${tokenApi.computer}${cid.value}/label/`,
      )
      helpdesk.value = data.helpdesk
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerData = async () => {
    if (!cid.value) return

    try {
      const response = await tokenGet(
        `${initialUrl.value.token}${tokenApi.computer}${cid.value}/`,
      )
      data.value = response.data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const computerAttribute = async () => {
    if (!cid.value) return

    try {
      const { data } = await tokenGet(
        `${initialUrl.value.token}${tokenApi.cidAttribute}${cid.value}`,
      )

      if (data.count === 1) attribute.value = data.results[0].id
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setComputerLink = () => {
    link.value = serverVersion.value.startsWith('4.')
      ? `${protocol.value}://${host.value}/admin/server/computer/${cid.value}/change/`
      : `${protocol.value}://${host.value}/computers/results/${cid.value}/`
  }

  const registerComputer = async ({ user, password }) => {
    try {
      const { data } = await api.post(
        `${internalApi}/computer/register/?version=${clientVersion.value}`,
        { user, password },
      )

      if (data === 0) {
        uiStore.notifyError(
          gettext.$gettext('There was a problem with registration'),
        )
        return
      }

      uiStore.notifySuccess(gettext.$gettext('Registered Computer!'))
      computerId()
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  return {
    name,
    uuid,
    cid,
    project,
    user,
    link,
    mask,
    network,
    helpdesk,
    data,
    attribute,
    computerInfo,
    computerNetwork,
    computerId,
    computerLabel,
    computerData,
    computerAttribute,
    registerComputer,
  }
})
