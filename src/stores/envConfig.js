import { ref } from 'vue'
import { defineStore } from 'pinia'

import { envDefaults } from 'config/app.conf'

export const useEnvConfigStore = defineStore('envConfig', () => {
  const expressPort = ref(envDefaults.expressPort)
  const executionsLimit = ref(envDefaults.executionsLimit)
  const user = ref(envDefaults.user)
  const password = ref(envDefaults.password)
  const isLoaded = ref(false)

  const internalApi = ref(`http://localhost:${envDefaults.expressPort}`)

  const load = async () => {
    if (isLoaded.value) return

    try {
      const config = await window.electronAPI.getEnvConfig()
      expressPort.value = config.expressPort
      executionsLimit.value = config.executionsLimit
      user.value = config.user
      password.value = config.password
      internalApi.value = `http://localhost:${config.expressPort}`
      isLoaded.value = true
    } catch (error) {
      console.error('Failed to load env config:', error)
    }
  }

  return {
    expressPort,
    executionsLimit,
    user,
    password,
    internalApi,
    isLoaded,
    load,
  }
})
