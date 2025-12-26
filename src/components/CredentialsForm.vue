<template>
  <div>
    <p>
      <q-input
        v-model="usernameModel"
        autofocus
        lazy-rules
        :rules="[(val) => !!val || $gettext('* Required')]"
      >
        <template #label>
          {{ $gettext('User') }}
        </template>

        <template #prepend>
          <q-icon name="mdi-account" />
        </template>
      </q-input>
    </p>

    <p>
      <q-input
        id="password"
        v-model="passwordModel"
        lazy-rules
        :rules="[(val) => !!val || $gettext('* Required')]"
        :type="showPassword ? 'text' : 'password'"
        @keyup.enter="$emit('submit')"
      >
        <template #label>
          {{ $gettext('Password') }}
        </template>

        <template #prepend>
          <q-icon name="mdi-lock" />
        </template>

        <template #append>
          <q-icon
            :name="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>
    </p>
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
