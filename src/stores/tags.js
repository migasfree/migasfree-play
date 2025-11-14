import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useComputerStore } from './computer.js'
import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

import { internalApi } from 'config/app.conf'

export const useTagsStore = defineStore('tags', () => {
  const available = ref([])
  const assigned = ref([])

  const getAvailableTags = async () => {
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(programStore)
    const { cid } = storeToRefs(computerStore)

    if (!cid.value) return

    try {
      const { data } = await api.get(
        `${internalApi}/tags/available/?version=${clientVersion.value}`,
      )
      setAvailableTags(data)
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const getAssignedTags = async () => {
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(programStore)
    const { cid } = storeToRefs(computerStore)

    if (!cid.value) return

    try {
      const { data } = await api.get(
        `${internalApi}/tags/assigned/?version=${clientVersion.value}`,
      )
      setAssignedTags(data)
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setAvailableTags = (value) => {
    available.value = value
  }

  const setAssignedTags = (value) => {
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
