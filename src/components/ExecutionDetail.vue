<template>
  <q-scroll-observer @scroll="onScroll" />

  <q-expansion-item popup :default-opened="id === lastId">
    <template #header>
      <q-item-section v-if="icon" avatar>
        <q-avatar>
          <q-icon :name="icon" size="lg" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <div class="row items-center">
          {{ command }}
          <q-spinner-dots
            v-if="isCurrentlyRunning"
            color="primary"
            size="20px"
            class="q-ml-sm"
          />
        </div>
        <div class="text-caption text-blue-grey"><DateView :value="id" /></div>
      </q-item-section>

      <q-item-section side>
        <div class="row items-center">
          <q-btn
            v-if="isCurrentlyRunning"
            flat
            icon="mdi-stop"
            color="negative"
            @click.stop="cancelCommand"
          >
            <q-tooltip>{{ $gettext('Cancel') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="error"
            flat
            icon="mdi-bug"
            color="negative"
            @click.stop="showError = true"
          />

          <CopyButton :text="textToCopy" />
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

<script setup>
import { watch, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'
import { htmlToText } from 'html-to-text'

import CopyButton from 'components/CopyButton'
import DateView from 'components/DateView'

import { useExecutionsStore } from 'src/stores/executions'

const props = defineProps({
  id: { type: String, required: true },
  command: { type: String, required: true },
  text: { type: String, required: false, default: '' },
  error: { type: String, required: false, default: '' },
  icon: { type: String, required: false, default: '' },
})

const { $gettext } = useGettext()

const executionsStore = useExecutionsStore()
const { lastId, isRunningCommand } = storeToRefs(executionsStore)

const scrollInfo = ref({})
const showError = ref(false)

const isCurrentlyRunning = computed(
  () => props.id === lastId.value && isRunningCommand.value,
)

const textToCopy = computed(() => htmlToText(props.text))

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
  },
)

const onScroll = (info) => {
  scrollInfo.value = info
}

const cancelCommand = () => {
  executionsStore.cancelCurrentCommand()
}
</script>
