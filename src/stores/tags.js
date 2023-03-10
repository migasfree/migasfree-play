import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useComputerStore } from './computer'
import { useProgramStore } from './program'
import { useUiStore } from './ui'

import { internalApi } from 'config/app.conf'

export const useTagsStore = defineStore('tags', () => {
  const available = ref([])
  const assigned = ref([])

  async function getAvailableTags() {
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(programStore)
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
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(programStore)
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
