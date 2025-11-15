import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useComputerStore } from './computer.js'
import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

import { internalApi } from 'config/app.conf'

export const useTagsStore = defineStore('tags', () => {
  const computerStore = useComputerStore()
  const programStore = useProgramStore()
  const uiStore = useUiStore()

  const { cid } = storeToRefs(computerStore)
  const { clientVersion } = storeToRefs(programStore)

  const available = ref([])
  const assigned = ref([])

  const fetchTags = async (endpoint, setter) => {
    if (!cid.value) return

    try {
      const { data } = await api.get(
        `${internalApi}/tags/${endpoint}/?version=${clientVersion.value}`,
      )
      setter(data)
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const getAvailableTags = async () => {
    await fetchTags('available', setAvailableTags)
  }

  const getAssignedTags = async () => {
    await fetchTags('assigned', setAssignedTags)
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
