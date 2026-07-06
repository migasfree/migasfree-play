<template>
  <q-icon v-if="icon" :name="icon" size="sm" class="vertical-middle" />
  <span v-if="value" class="vertical-middle text-mono date-highlight">
    {{ showDate(value) }}
    <q-tooltip>
      <template v-if="tooltipText">
        {{ tooltipText }} ({{ diffForHumans(value) }})
      </template>
      <template v-else>{{ diffForHumans(value) }} </template></q-tooltip
    >
  </span>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { date } from 'quasar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
import 'dayjs/locale/ca'
import 'dayjs/locale/eu'
import 'dayjs/locale/fr'
import 'dayjs/locale/gl'
import 'dayjs/locale/en'

dayjs.extend(relativeTime)

defineProps({
  value: {
    type: [String],
    required: false,
    default: null,
  },
  icon: {
    type: String,
    required: false,
    default: '',
  },
  tooltipText: {
    type: String,
    required: false,
    default: '',
  },
})

const { current } = useGettext()

const showDate = (isoString) => {
  return date.formatDate(Date.parse(isoString), 'YYYY-MM-DD HH:mm:ss')
}

const diffForHumans = (isoString) => {
  const locale = (current || 'es').split('_')[0]
  if (locale) {
    dayjs.locale(locale)
  }

  return dayjs(isoString).fromNow()
}
</script>

<style lang="scss" scoped>
.date-highlight {
  color: var(--text-main);
  opacity: 0.9;
  font-weight: 500;
}
</style>
