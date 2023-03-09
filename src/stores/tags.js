import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useAppStore } from './app'
import { useComputerStore } from './computer'
import { useUiStore } from './ui'

import { internalApi } from 'config/app.conf'

export const useTagsStore = defineStore('tags', () => {
  const available = ref([])
  const assigned = ref([])

  async function getAvailableTags() {
    const appStore = useAppStore()
    const computerStore = useComputerStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(appStore)
    const { cid } = storeToRefs(computerStore)

    if (cid.value)
      await api
        .get(`${internalApi}/tags/available/?version=${clientVersion.value}`)
        .then((response) => {
          setAvailableTags(response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  async function getAssignedTags() {
    const appStore = useAppStore()
    const computerStore = useComputerStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(appStore)
    const { cid } = storeToRefs(computerStore)

    if (cid.value)
      await api
        .get(`${internalApi}/tags/assigned/?version=${clientVersion.value}`)
        .then((response) => {
          setAssignedTags(response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  function setAvailableTags(value) {
    available.value = value
  }

  function setAssignedTags(value) {
    assigned.value = value
  }

  return {
    available,
    assigned,
    getAvailableTags,
    getAssignedTags,
    setAssignedTags,
  }
})
