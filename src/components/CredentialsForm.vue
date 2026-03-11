<template>
  <div class="q-gutter-y-md">
    <q-input
      v-model="usernameModel"
      filled
      autofocus
      lazy-rules
      :label="$gettext('User')"
      :rules="[(val) => !!val || $gettext('* Required')]"
    >
      <template #prepend>
        <q-icon name="mdi-account-outline" class="q-mr-xs" />
      </template>
    </q-input>

    <q-input
      id="password"
      v-model="passwordModel"
      filled
      lazy-rules
      :label="$gettext('Password')"
      :rules="[(val) => !!val || $gettext('* Required')]"
      :type="showPassword ? 'text' : 'password'"
      @keyup.enter="$emit('submit')"
    >
      <template #prepend>
        <q-icon name="mdi-lock-outline" class="q-mr-xs" />
      </template>

      <template #append>
        <q-icon
          :name="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
          class="cursor-pointer icon-btn-hover"
          @click="showPassword = !showPassword"
        >
          <q-tooltip>{{
            showPassword ? $gettext('Hide') : $gettext('Show')
          }}</q-tooltip>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  username: { type: String, default: '' },
  password: { type: String, default: '' },
})

const emit = defineEmits(['update:username', 'update:password', 'submit'])

const showPassword = ref(false)

const usernameModel = computed({
  get: () => props.username,
  set: (val) => emit('update:username', val),
})

const passwordModel = computed({
  get: () => props.password,
  set: (val) => emit('update:password', val),
})
</script>

<style scoped>
.icon-btn-hover {
  transition:
    transform 0.2s ease,
    color 0.2s ease;
  &:hover {
    transform: scale(1.1);
    color: var(--brand-primary);
  }
}
</style>
