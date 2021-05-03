<template>
  <div class="row">
    <div class="col">
      <q-card class="q-ma-md" flat>
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
              @filter="filterFn"
            />
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            :label="$gettext('Communicate')"
            text-color="primary"
            class="q-ma-md"
            icon="mdi-comment-processing"
            :loading="$store.state.executions.isRunningCommand"
            :disabled="$store.state.executions.isRunningCommand"
            @click="communicate($event)"
            ><q-tooltip>{{
              $gettext('Communicate tags to the server')
            }}</q-tooltip></q-btn
          >

          <q-btn
            :label="$gettext('Set')"
            color="primary"
            icon="mdi-cog-transfer"
            :loading="$store.state.executions.isRunningCommand"
            :disabled="$store.state.executions.isRunningCommand"
            @click="setTags($event)"
            ><q-tooltip>{{
              $gettext('Set tags at the server')
            }}</q-tooltip></q-btn
          >
        </q-card-actions>
      </q-card>
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
    communicate(event) {
      console.log(event)
      event.srcElement.parentElement.parentElement.parentElement.disabled = true
      this.$store.dispatch('ui/notifyInfo', this.$gettext('Communicating...'))

      this.$store.dispatch('executions/run', {
        cmd: `migasfree --quiet tags --communicate ${this.tags.join(' ')}`,
        text: this.$gettext('Communicate Tags'),
        element: event.srcElement.parentElement.parentElement.parentElement
      })
    },

    setTags(event) {
      console.log(event)
      event.srcElement.parentElement.parentElement.parentElement.disabled = true
      this.$store.dispatch('ui/notifyInfo', this.$gettext('Setting Tags...'))

      this.$store.dispatch('executions/run', {
        cmd: `migasfree --quiet tags --set ${this.tags.join(' ')}`,
        text: this.$gettext('Set Tags'),
        element: event.srcElement.parentElement.parentElement.parentElement
      })
    },

    filterFn(val, update) {
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
