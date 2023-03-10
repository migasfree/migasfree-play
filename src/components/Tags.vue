<template>
  <div class="row">
    <div class="col">
      <q-card v-if="options.length > 0 || tags.length > 0" class="q-ma-sm" flat>
        <q-card-section>
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
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
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
            color="primary"
            class="q-px-sm"
            icon="mdi-cog-transfer"
            size="lg"
            :loading="isRunningCommand"
            :disabled="isRunningCommand"
            @click="setTags"
            ><q-tooltip>{{
              $gettext('Set tags at the server')
            }}</q-tooltip></q-btn
          >
        </q-card-actions>
      </q-card>

      <q-banner v-else class="bg-info text-black q-ma-md">
        <template #avatar>
          <q-icon name="mdi-information-outline" color="white" />
        </template>
        {{ $gettext('There are not items to show.') }}
      </q-banner>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'

import { useExecutionsStore } from 'src/stores/executions'
import { useProgramStore } from 'src/stores/program'
import { useTagsStore } from 'src/stores/tags'
import { useUiStore } from 'src/stores/ui'

export default {
  name: 'Tags',
  setup() {
    const { $gettext } = useGettext()

    const executionsStore = useExecutionsStore()
    const programStore = useProgramStore()
    const tagsStore = useTagsStore()
    const uiStore = useUiStore()

    const { isRunningCommand } = storeToRefs(executionsStore)
    const { available, assigned } = storeToRefs(tagsStore)

    const tags = ref([])
    const options = ref([])
    const allOptions = ref([])

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
      if (programStore.clientVersion.startsWith('4.')) {
        if (tags.value.length === 0) cmd = 'migasfree-tags --communicate ""'
        else cmd = `migasfree-tags --communicate ${tags.value.join(' ')}`
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
      if (programStore.clientVersion.startsWith('4.')) {
        if (tags.value.length === 0) cmd = 'migasfree-tags --set ""'
        else cmd = `migasfree-tags --set ${tags.value.join(' ')}`
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
          (v) => v.toLowerCase().indexOf(needle) > -1
        )
      })
    }

    onMounted(() => {
      const optionsTmp = new Set(assigned.value)

      Object.entries(available.value).map(([key, val]) => {
        val.forEach((element) => optionsTmp.add(element))
      })

      allOptions.value = Array.from(optionsTmp).sort()
      options.value = allOptions.value

      tags.value = assigned.value
    })

    return {
      isRunningCommand,
      tags,
      options,
      allOptions,
      resetTags,
      updateTags,
      communicate,
      setTags,
      filterTags,
    }
  },
}
</script>
