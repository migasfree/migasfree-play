<template>
  <q-btn
    flat
    :icon="currentIcon"
    :color="currentColor"
    :size="size"
    :dense="dense"
    :round="round"
    @click.stop="copy"
  >
    <q-tooltip>{{ tooltip }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { ref, computed } from 'vue'
import { copyToClipboard } from 'quasar'
import { useGettext } from 'vue3-gettext'
import { useUiStore } from 'src/stores/ui'

const props = defineProps({
  text: { type: String, required: true },
  icon: { type: String, default: 'mdi-content-copy' },
  size: { type: String, default: 'md' },
  dense: { type: Boolean, default: false },
  round: { type: Boolean, default: false },
  tooltip: { type: String, default: '' },
})

const { $gettext } = useGettext()
const uiStore = useUiStore()

const copied = ref(false)

const currentIcon = computed(() => (copied.value ? 'mdi-check' : props.icon))
const currentColor = computed(() => (copied.value ? 'positive' : 'primary'))
const tooltip = computed(() => props.tooltip || $gettext('Copy'))

const copy = async () => {
  try {
    await copyToClipboard(props.text)
    copied.value = true
    uiStore.notifySuccess($gettext('Text copied to clipboard'))

    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    uiStore.notifyError($gettext('Failed to copy text'))
  }
}
</script>
