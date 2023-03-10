import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useProgramStore } from './program'
import { useUiStore } from './ui'

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

  async function computerInfo() {
    const uiStore = useUiStore()

    await api
      .get(`${internalApi}/preferences/server`)
      .then((response) => {
        uuid.value = response.data.uuid
        name.value = response.data.computer_name
        user.value = response.data.user
        project.value = response.data.project
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function computerNetwork() {
    const uiStore = useUiStore()

    await api
      .get(`${internalApi}/computer/network`)
      .then((response) => {
        mask.value = response.data.mask
        network.value = response.data.network
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function computerId() {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { clientVersion, protocol, host } = storeToRefs(programStore)

    if (clientVersion.value.startsWith('4.')) {
      await api
        .get(
          `${protocol.value}://${host.value}/get_computer_info/?uuid=${uuid.value}`
        )
        .then((response) => {
          cid.value = response.data.id
          helpdesk.value = response.data.helpdesk
          setComputerLink()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    } else {
      await api
        .get(`${internalApi}/computer/id`)
        .then((response) => {
          cid.value = response.data
          setComputerLink()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }
  }

  async function computerLabel() {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { initialUrl, token } = storeToRefs(programStore)

    if (cid.value)
      await api
        .get(
          `${initialUrl.value.token}${tokenApi.computer}${cid.value}/label/`,
          {
            headers: { Authorization: token.value },
          }
        )
        .then((response) => {
          helpdesk.value = response.data.helpdesk
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  async function computerData() {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { initialUrl, token } = storeToRefs(programStore)

    if (cid.value)
      await api
        .get(`${initialUrl.value.token}${tokenApi.computer}${cid.value}/`, {
          headers: { Authorization: token.value },
        })
        .then((response) => {
          data.value = response.data
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  async function computerAttribute() {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { initialUrl, token } = storeToRefs(programStore)

    if (cid.value)
      await api
        .get(`${initialUrl.value.token}${tokenApi.cidAttribute}${cid.value}`, {
          headers: { Authorization: token.value },
        })
        .then((response) => {
          if (response.data.count === 1)
            attribute.value = response.data.results[0].id
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  function setComputerLink() {
    const programStore = useProgramStore()
    const { serverVersion, protocol, host } = storeToRefs(programStore)

    if (serverVersion.value.startsWith('4.'))
      link.value = `${protocol.value}://${host.value}/admin/server/computer/${cid.value}/change/`
    else
      link.value = `${protocol.value}://${host.value}/computers/results/${cid.value}/`
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
  }
})
