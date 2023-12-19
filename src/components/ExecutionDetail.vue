<template>
  <q-scroll-observer @scroll="onScroll" />

  <q-expansion-item popup :default-opened="id === lastId ? true : false">
    <template #header>
      <q-item-section v-if="icon" avatar>
        <q-avatar>
          <q-icon :name="icon" size="lg" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        {{ command }}
        <div class="text-caption text-blue-grey"><DateView :value="id" /></div>
      </q-item-section>

      <q-item-section side>
        <div class="row items-center">
          <q-btn
            v-if="error"
            flat
            icon="mdi-bug"
            color="negative"
            @click.stop="showError = true"
          />
          <q-btn
            flat
            icon="mdi-content-copy"
            color="primary"
            @click.stop="copyDetails"
          />
        </div>
      </q-item-section>
    </template>

    <q-separator />

    <q-card>
      <q-card-section class="text-mono" v-html="text"> </q-card-section>
    </q-card>
  </q-expansion-item>

  <q-dialog v-model="showError" full-width>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-card-section class="text-mono" v-html="error"> </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { copyToClipboard } from 'quasar'
import { htmlToText } from 'html-to-text'

import DateView from 'components/DateView'

import { useExecutionsStore } from 'src/stores/executions'
import { useUiStore } from 'src/stores/ui'

export default {
  name: 'ExecutionDetail',
  components: { DateView },
  props: {
    id: { type: String, required: true },
    command: { type: String, required: true },
    text: { type: String, required: false, default: '' },
    error: { type: String, required: false, default: '' },
    icon: { type: String, required: false, default: '' },
  },
  setup(props) {
    const { $gettext } = useGettext()

    const uiStore = useUiStore()
    const executionsStore = useExecutionsStore()
    const { lastId } = storeToRefs(executionsStore)

    const scrollInfo = ref({})
    const showError = ref(false)

    watch(
      () => props.text,
      () => {
        const elem = document.getElementById('main')

        if (
          !('position' in scrollInfo.value) ||
          (scrollInfo.value.direction === 'down' &&
            scrollInfo.value.position.top - elem.scrollHeight < 150)
        ) {
          window.scrollTo(0, elem.scrollHeight)
        }
      }
    )

    const onScroll = (info) => {
      scrollInfo.value = info
    }

    const copyDetails = () => {
      copyToClipboard(htmlToText(props.text)).then(() => {
        uiStore.notifySuccess($gettext('Text copied to clipboard'))
      })
    }

    return { showError, lastId, copyDetails, onScroll }
  },
}
</script>
