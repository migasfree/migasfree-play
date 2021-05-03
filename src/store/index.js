import Vue from 'vue'
import Vuex from 'vuex'

import app from './app'
import computer from './computer'
import devices from './devices'
import executions from './executions'
import filters from './filters'
import packages from './packages'
import preferences from './preferences'
import tags from './tags'
import ui from './ui'

Vue.use(Vuex)

export default function(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      app,
      computer,
      devices,
      executions,
      filters,
      packages,
      preferences,
      tags,
      ui
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING
  })

  return Store
}
