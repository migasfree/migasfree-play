import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useComputerStore } from './computer.js'

import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

export const useTagsStore = defineStore('tags', () => {
  const computerStore = useComputerStore()
  const programStore = useProgramStore()
  const uiStore = useUiStore()

  const { cid } = storeToRefs(computerStore)
  const { clientVersion } = storeToRefs(programStore)

  const available = ref([])
  const assigned = ref([])

  const getTags = async () => {
    if (!cid.value) return

    try {
      const data = await window.electronAPI.tags.get(clientVersion.value)
      setAvailableTags(data.available)
      setAssignedTags(data.assigned)
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
    getTags,
    setAssignedTags,
  }
})
