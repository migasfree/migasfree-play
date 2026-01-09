<template>
  <q-banner class="bg-light-blue-3 text-black q-ma-md">
    <template #avatar>
      <q-icon name="mdi-information-outline" color="black" />
    </template>
    {{ message }}
  </q-banner>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
})
</script>
