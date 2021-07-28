<template>
  <q-expansion-item
    popup
    :default-opened="id === $store.state.executions.lastId ? true : false"
  >
    <template #header>
      <q-item-section v-if="icon" avatar>
        <q-avatar>
          <q-icon :name="icon" size="lg" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        {{ command }}
        <div class="text-caption text-blue-grey">{{ showDate(id) }}</div>
      </q-item-section>
    </template>

    <q-separator />

    <q-card>
      <q-card-section class="text-mono" v-html="text"> </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script>
import { watch } from 'vue'
import { date } from 'quasar'

export default {
  name: 'ExecutionDetail',
  props: {
    id: { type: String, required: true },
    command: { type: String, required: true },
    text: { type: String, required: false, default: '' },
    icon: { type: String, required: false, default: '' },
  },
  setup(props) {
    watch(
      () => props.text,
      () => {
        window.scrollTo(0, document.getElementById('main').scrollHeight)
      }
    )

    const showDate = (isoString) => {
      return date.formatDate(Date.parse(isoString), 'YYYY-MM-DD HH:mm:ss')
    }

    return { showDate }
  },
}
</script>
