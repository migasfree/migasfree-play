<template>
  <FilterCard v-if="options.length > 0 || tags.length > 0">
    <div class="row q-col-gutter-md items-center">
      <!-- Tags Selection -->
      <div class="col-12">
        <q-select
          v-model="tags"
          dense
          filled
          multiple
          use-input
          clearable
          input-debounce="0"
          class="tags-selector"
          :label="$gettext('Assigned Tags')"
          :placeholder="$gettext('Add or search tags...')"
          :options="options"
          @filter="filterTags"
          @update:model-value="updateTags"
          @clear="resetTags"
        >
          <template #selected-item="scope">
            <q-chip
              removable
              dense
              class="tag-chip text-weight-medium"
              :icon="appIcon('tags')"
              color="primary"
              text-color="white"
              :tabindex="scope.tabindex"
              @remove="scope.removeAtIndex(scope.index)"
            >
              {{ scope.opt }}
            </q-chip>
          </template>
        </q-select>
      </div>
    </div>

    <template #actions>
      <div
        class="row q-gutter-x-sm q-pa-md items-center justify-end full-width"
      >
        <!-- Help/Info Button (Optional enhancement) -->
        <q-btn
          flat
          round
          dense
          color="grey-7"
          :icon="appIcon('info_outline')"
          class="action-btn"
        >
          <q-tooltip>{{
            $gettext(
              'Tags allow you to classify this computer to receive specific software or belong to logical management groups.',
            )
          }}</q-tooltip>
        </q-btn>

        <q-separator vertical inset class="q-mx-sm action-separator" />

        <q-btn
          v-if="!userIsPrivileged"
          unelevated
          color="warning"
          class="action-btn q-px-md"
          :icon="appIcon('unlock')"
          :label="$gettext('Unlock Management')"
          @click="openLogin"
        >
          <q-tooltip>{{ $gettext('Manage with privileges') }}</q-tooltip>
        </q-btn>

        <template v-else>
          <q-btn
            flat
            color="primary"
            class="action-btn q-px-md"
            icon="mdi-comment-processing"
            :loading="isRunningCommand"
            :disabled="isRunningCommand"
            :label="$gettext('Communicate')"
            @click="communicate"
          >
            <q-tooltip>{{
              $gettext('Communicate tags to the server')
            }}</q-tooltip>
          </q-btn>

          <q-btn
            unelevated
            color="primary"
            class="action-btn q-px-md"
            icon="mdi-cog-transfer"
            :loading="isRunningCommand"
            :disabled="isRunningCommand"
            :label="$gettext('Set Tags')"
            @click="setTags"
          >
            <q-tooltip>{{ $gettext('Set tags at the server') }}</q-tooltip>
          </q-btn>
        </template>
      </div>
    </template>
  </FilterCard>

  <div v-else class="row q-col-gutter-md">
    <div class="col-12">
      <BannerInfo :message="$gettext('There are no tags available to show.')" />
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
import { appIcon } from 'src/composables/element'

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
    icon: appIcon('communicate'),
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
    icon: appIcon('set-tags'),
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

<style lang="scss" scoped>
.tags-selector {
  transition: all 0.3s ease;
}

.tag-chip {
  height: 28px;
  font-size: 0.85rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.action-separator {
  height: 24px;
}
</style>
