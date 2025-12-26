<template>
  <div>
    <q-breadcrumbs class="q-mx-sm">
      <q-breadcrumbs-el :label="title" :icon="icon" />

      <div v-if="showCount && count > 0" class="row items-center q-ml-xs">
        <q-chip
          outline
          color="primary"
          text-color="white"
          class="text-right"
          size="sm"
        >
          {{ count }}
        </q-chip>
      </div>

      <slot />

      <q-space />

      <q-btn
        v-if="showSync"
        icon="mdi-sync"
        round
        flat
        color="primary"
        :loading="loading"
        :disabled="loading"
        @click="$emit('sync')"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip>
      </q-btn>
    </q-breadcrumbs>

    <div v-if="loading" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <slot v-else name="content" />
  </div>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()

defineProps({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  count: { type: Number, default: 0 },
  showCount: { type: Boolean, default: true },
  showSync: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['sync'])
</script>
