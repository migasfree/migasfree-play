<template>
  <div class="row">
    <div class="col">
      <q-card v-if="options.length > 0 || tags.length > 0" class="q-ma-md" flat>
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
            :loading="$store.state.executions.isRunningCommand"
            :disabled="$store.state.executions.isRunningCommand"
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
            :loading="$store.state.executions.isRunningCommand"
            :disabled="$store.state.executions.isRunningCommand"
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
import { useStore } from 'vuex'
import { useGettext } from '@jshmrtn/vue3-gettext'

export default {
  name: 'Tags',
  setup() {
    const store = useStore()
    const { $gettext } = useGettext()

    const tags = ref([])
    const options = ref([])
    const allOptions = ref([])

    const resetTags = () => {
      tags.value = []
    }

    const updateTags = () => {
      store.commit('tags/setAssignedTags', tags.value)
    }

    const communicate = () => {
      store.dispatch('ui/notifyInfo', $gettext('Communicating...'))

      store.dispatch('executions/run', {
        cmd: `migasfree --quiet tags --communicate ${tags.value.join(' ')}`,
        text: $gettext('Communicate Tags'),
        icon: 'mdi-comment-processing',
      })
    }

    const setTags = () => {
      store.dispatch('ui/notifyInfo', $gettext('Setting Tags...'))

      store.dispatch('executions/run', {
        cmd: `migasfree --quiet tags --set ${tags.value.join(' ')}`,
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
      const optionsTmp = new Set(store.state.tags.assigned)

      Object.entries(store.state.tags.available).map(([key, val]) => {
        val.forEach((element) => optionsTmp.add(element))
      })

      allOptions.value = Array.from(optionsTmp).sort()
      options.value = allOptions.value

      tags.value = store.state.tags.assigned
    })

    return {
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
