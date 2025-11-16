<template>
  <q-breadcrumbs>
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
  </q-breadcrumbs>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  count: { type: Number, default: 0 },
  showCount: { type: Boolean, default: true },
})
</script>
