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
export default {
  name: 'Tags',
  data() {
    return {
      tags: [],
      options: [],
      allOptions: []
    }
  },
  mounted() {
    const options = new Set(this.$store.state.tags.assigned)

    Object.entries(this.$store.state.tags.available).map(([key, val]) => {
      val.forEach((element) => options.add(element))
    })

    this.allOptions = Array.from(options).sort()

    this.tags = this.$store.state.tags.assigned
  },
  methods: {
    communicate() {
      this.$store.dispatch('ui/notifyInfo', this.$gettext('Communicating...'))

      this.$store.dispatch('executions/run', {
        cmd: `migasfree --quiet tags --communicate ${this.tags.join(' ')}`,
        text: this.$gettext('Communicate Tags'),
        icon: 'mdi-comment-processing'
      })
    },

    setTags() {
      this.$store.dispatch('ui/notifyInfo', this.$gettext('Setting Tags...'))

      this.$store.dispatch('executions/run', {
        cmd: `migasfree --quiet tags --set ${this.tags.join(' ')}`,
        text: this.$gettext('Set Tags'),
        icon: 'mdi-cog-transfer'
      })
    },

    filterTags(val, update) {
      if (val === '') {
        update(() => {
          this.options = this.allOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.allOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        )
      })
    }
  }
}
</script>
