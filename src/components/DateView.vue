<template>
  <q-icon v-if="icon" :name="icon" size="sm" class="vertical-middle" />
  <span v-if="value" class="vertical-middle">
    {{ showDate(value) }}
    <q-tooltip>
      <template v-if="tooltipText">
        {{ tooltipText }} ({{ diffForHumans(value) }})
      </template>
      <template v-else>{{ diffForHumans(value) }} </template></q-tooltip
    >
  </span>
</template>

<script>
import { useGettext } from 'vue3-gettext'
import { date } from 'quasar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default {
  name: 'DateView',

  props: {
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
  },

  setup() {
    const { current } = useGettext()

    const showDate = (isoString) => {
      return date.formatDate(Date.parse(isoString), 'YYYY-MM-DD HH:mm:ss')
    }

    const diffForHumans = (isoString) => {
      const locale = current.split('_')[0]
      if (locale)
        import(`dayjs/locale/${locale}.js`).then((module) => {
          dayjs.locale(module.default.name)
        })

      return dayjs(isoString).fromNow()
    }

    return { showDate, diffForHumans }
  },
}
</script>
