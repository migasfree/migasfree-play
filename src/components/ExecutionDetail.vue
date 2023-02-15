<template>
  <q-expansion-item popup :default-opened="id === lastId ? true : false">
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

      <q-item-section side>
        <q-btn
          flat
          icon="mdi-content-copy"
          color="primary"
          @click.stop="copyDetails"
        />
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
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { copyToClipboard, date } from 'quasar'
import { htmlToText } from 'html-to-text'

import { useExecutionsStore } from 'src/stores/executions'
import { useUiStore } from 'src/stores/ui'

export default {
  name: 'ExecutionDetail',
  props: {
    id: { type: String, required: true },
    command: { type: String, required: true },
    text: { type: String, required: false, default: '' },
    icon: { type: String, required: false, default: '' },
  },
  setup(props) {
    const { $gettext } = useGettext()

    const uiStore = useUiStore()
    const executionsStore = useExecutionsStore()
    const { lastId } = storeToRefs(executionsStore)

    watch(
      () => props.text,
      () => {
        window.scrollTo(0, document.getElementById('main').scrollHeight)
      }
    )

    const showDate = (isoString) => {
      return date.formatDate(Date.parse(isoString), 'YYYY-MM-DD HH:mm:ss')
    }

    const copyDetails = () => {
      copyToClipboard(htmlToText(props.text)).then(() => {
        uiStore.notifySuccess($gettext('Text copied to clipboard'))
      })
    }

    return { lastId, showDate, copyDetails }
  },
}
</script>
