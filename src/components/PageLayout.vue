<template>
  <div>
    <q-breadcrumbs class="q-mx-sm">
      <q-breadcrumbs-el :label="props.title" :icon="props.icon" />

      <div
        v-if="props.showCount && props.totalCount > 0"
        class="row items-center q-ml-sm"
      >
        <q-badge unelevated class="page-header-badge">
          <template v-if="props.count < props.totalCount">
            {{ props.count }} / {{ props.totalCount }}
          </template>
          <template v-else>
            {{ props.totalCount }}
          </template>
        </q-badge>
      </div>

      <slot />

      <q-space />

      <q-btn
        v-if="props.showSync"
        icon="mdi-sync"
        round
        flat
        color="primary"
        :loading="props.loading"
        :disabled="props.loading"
        @click="$emit('sync')"
      >
        <q-tooltip>{{ $gettext('Update') }}</q-tooltip>
      </q-btn>
    </q-breadcrumbs>

    <div v-if="props.loading" class="row q-ma-xl">
      <div class="col-12 text-center">
        <q-spinner color="primary" size="6em" />
      </div>
    </div>

    <slot v-else name="content" />
  </div>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  count: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  showCount: { type: Boolean, default: true },
  showSync: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
})

const { $gettext } = useGettext()

defineEmits(['sync'])
</script>

<style lang="scss" scoped>
.page-header-badge {
  background: var(--brand-primary) !important;
  color: #fff !important;
  border-radius: 12px !important;
  font-weight: 800;
  padding: 4px 10px;
  font-size: 11px;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.body--dark .page-header-badge {
  background: rgba(var(--q-accent-rgb), 0.2) !important;
  color: var(--q-accent) !important;
  border: 1px solid rgba(var(--q-accent-rgb), 0.3);
}
</style>
