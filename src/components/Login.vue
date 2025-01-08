<template>
  <q-dialog v-model="showing" persistent>
    <q-card flat>
      <q-card-section class="row items-center">
        <div class="text-h5">
          {{ $gettext('User with privileges on the computer') }}
        </div>
      </q-card-section>

      <q-card-section>
        <p>
          <q-input
            v-model="username"
            autofocus
            lazy-rules
            :rules="[(val) => !!val || $gettext('* Required')]"
          >
            <template #label>
              <translate>User</translate>
            </template>

            <template #prepend>
              <q-icon name="mdi-account" />
            </template>
          </q-input>
        </p>

        <p>
          <q-input
            id="password"
            v-model="password"
            lazy-rules
            :rules="[(val) => !!val || $gettext('* Required')]"
            :type="showPassword ? 'text' : 'password'"
            @keyup.enter="login"
          >
            <template #label>
              <translate>Password</translate>
            </template>

            <template #prepend>
              <q-icon name="mdi-lock" />
            </template>

            <template #append>
              <q-icon
                :name="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          flat
          color="primary"
          :label="$gettext('Cancel')"
          @click="$emit('closed')"
        />
        <q-btn
          v-close-popup
          icon="mdi-login"
          color="positive"
          :disabled="!isValid"
          :label="$gettext('Login')"
          @click="login"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'

import { useProgramStore } from 'src/stores/program'

export default {
  name: 'Login',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['closed'],
  setup(props, { emit }) {
    const programStore = useProgramStore()

    const username = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const showing = ref(props.value)

    const isValid = computed(
      () => username.value !== '' && password.value !== '',
    )

    const login = () => {
      if (username.value && password.value) {
        programStore.checkUser({
          username: username.value,
          password: password.value,
        })
        username.value = ''
        password.value = ''
        emit('closed')
      }
    }

    watch(
      () => props.value,
      (newVal) => {
        showing.value = newVal
      },
    )

    return {
      username,
      password,
      showPassword,
      showing,
      isValid,
      login,
    }
  },
}
</script>
