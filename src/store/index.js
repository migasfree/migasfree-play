import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

import app from './app'
import computer from './computer'
import devices from './devices'
import executions from './executions'
import filters from './filters'
import packages from './packages'
import preferences from './preferences'
import tags from './tags'
import ui from './ui'

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      app,
      computer,
      devices,
      executions,
      filters,
      packages,
      preferences,
      tags,
      ui,
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING,
  })

  return Store
})
