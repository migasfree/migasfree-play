<template>
  <FilterCard v-if="options.length > 0 || tags.length > 0">
    <p>
      <q-select
        v-model="tags"
        :label="$gettext('Tags')"
        multiple
        clearable
        use-input
        input-debounce="0"
        :options="options"
        @filter="filterTags"
        @update:model-value="updateTags"
        @clear="resetTags"
      >
        <template #selected-item="scope">
          <q-chip
            outline
            square
            removable
            dense
            color="primary"
            class="q-pa-md"
            icon="mdi-tag"
            :tabindex="scope.tabindex"
            @remove="scope.removeAtIndex(scope.index)"
          >
            {{ scope.opt }}
          </q-chip>
        </template>
      </q-select>
    </p>

    <template #actions>
      <q-btn
        v-if="!userIsPrivileged"
        class="q-ma-md q-px-sm"
        color="orange"
        size="lg"
        icon="mdi-wizard-hat"
        @click="openLogin"
      >
        <q-tooltip>{{ $gettext('Manage with privileges') }}</q-tooltip>
      </q-btn>

      <q-btn
        v-if="userIsPrivileged"
        text-color="primary"
        class="q-ma-md q-px-sm"
        icon="mdi-comment-processing"
        size="lg"
        :loading="isRunningCommand"
        :disabled="isRunningCommand"
        @click="communicate"
        ><q-tooltip>{{
          $gettext('Communicate tags to the server')
        }}</q-tooltip></q-btn
      >

      <q-btn
        v-if="userIsPrivileged"
        color="primary"
        class="q-px-sm"
        icon="mdi-cog-transfer"
        size="lg"
        :loading="isRunningCommand"
        :disabled="isRunningCommand"
        @click="setTags"
        ><q-tooltip>{{ $gettext('Set tags at the server') }}</q-tooltip></q-btn
      >
    </template>
  </FilterCard>

  <div v-else class="row">
    <div class="col">
      <BannerInfo :message="$gettext('There are not items to show.')" />
    </div>
  </div>

  <Login :value="showLogin" @closed="showLogin = !showLogin" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'

import BannerInfo from 'components/BannerInfo'
import FilterCard from 'components/FilterCard'
import Login from 'components/Login'

import { useExecutionsStore } from 'src/stores/executions'
import { useProgramStore } from 'src/stores/program'
import { useTagsStore } from 'src/stores/tags'
import { useUiStore } from 'src/stores/ui'

const { $gettext } = useGettext()

const executionsStore = useExecutionsStore()
const programStore = useProgramStore()
const tagsStore = useTagsStore()
const uiStore = useUiStore()

const { isRunningCommand } = storeToRefs(executionsStore)
const { available, assigned } = storeToRefs(tagsStore)
const { clientVersion, userIsPrivileged } = storeToRefs(programStore)

const tags = ref([])
const options = ref([])
const allOptions = ref([])
const showLogin = ref(false)

const openLogin = () => {
  showLogin.value = true
}

const resetTags = () => {
  tags.value = []
}

const updateTags = () => {
  if (tags.value === null) resetTags()
  tagsStore.setAssignedTags(tags.value)
}

const communicate = () => {
  uiStore.notifyInfo($gettext('Communicating...'))

  let cmd = `migasfree --quiet tags --communicate ${tags.value.join(' ')}`
  if (clientVersion.value.startsWith('4.')) {
    const tagArg = tags.value.length ? tags.value.join(' ') : '""'
    cmd = `migasfree-tags --communicate ${tagArg}`
  }

  executionsStore.run({
    cmd,
    text: $gettext('Communicate Tags'),
    icon: 'mdi-comment-processing',
  })
}

const setTags = () => {
  uiStore.notifyInfo($gettext('Setting Tags...'))

  let cmd = `migasfree --quiet tags --set ${tags.value.join(' ')}`
  if (clientVersion.value.startsWith('4.')) {
    const tagArg = tags.value.length ? tags.value.join(' ') : '""'
    cmd = `migasfree-tags --set ${tagArg}`
  }

  executionsStore.run({
    cmd,
    text: $gettext('Set Tags'),
    icon: 'mdi-cog-transfer',
  })
}

const filterTags = (val, update) => {
  if (val === '') {
    update(() => {
      options.value = allOptions.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    options.value = allOptions.value.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1,
    )
  })
}

onMounted(() => {
  const optionsTmp = new Set([
    ...assigned.value,
    ...Object.values(available.value).flat(),
  ])

  allOptions.value = [...optionsTmp].sort()
  options.value = allOptions.value

  tags.value = assigned.value
})
</script>
