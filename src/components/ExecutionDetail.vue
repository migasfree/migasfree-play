<template>
  <q-expansion-item
    popup
    :default-opened="id === $store.state.executions.lastId ? true : false"
    :label="command"
    :caption="showDate(id)"
  >
    <q-separator />

    <q-card>
      <q-card-section class="text-mono" v-html="text"> </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'ExecutionDetail',
  props: {
    id: { type: String, required: true },
    command: { type: String, required: true },
    text: { type: String, required: false, default: '' }
  },
  watch: {
    text: function() {
      window.scrollTo(0, document.getElementById('main').scrollHeight)
    }
  },
  methods: {
    showDate(isoString, format = '') {
      return date.formatDate(Date.parse(isoString), 'YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
