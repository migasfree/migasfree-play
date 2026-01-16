import { ref } from 'vue'
import { defineStore } from 'pinia'

import { envDefaults } from 'config/app.conf'

export const useEnvConfigStore = defineStore('envConfig', () => {
  const executionsLimit = ref(envDefaults.executionsLimit)
  const user = ref(envDefaults.user)
  const password = ref(envDefaults.password)
  const isLoaded = ref(false)

  const load = async () => {
    if (isLoaded.value) return

    try {
      const config = await window.electronAPI.getEnvConfig()
      executionsLimit.value = config.executionsLimit
      user.value = config.user
      password.value = config.password
      isLoaded.value = true
    } catch (error) {
      console.error('Failed to load env config:', error)
    }
  }

  return {
    executionsLimit,
    user,
    password,
    isLoaded,
    load,
  }
})
