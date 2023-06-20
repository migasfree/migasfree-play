<template>
  <q-dialog v-model="showing" persistent>
    <q-card flat>
      <q-banner class="bg-warning text-black">
        {{
          $gettext(
            'Review config data. If is not correct, cancel register and modify migasfree-client file config.'
          )
        }}
        <q-card-section>
          <q-card flat bordered class="half q-ma-md">
            <q-item>
              <q-item-section avatar>
                <q-icon name="mdi-server" />
              </q-item-section>

              <q-item-section class="text-h6"
                >{{ host }} ({{ serverVersion }})</q-item-section
              >
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="mdi-sitemap" />
              </q-item-section>

              <q-item-section class="text-h6">{{ project }}</q-item-section>
            </q-item>
          </q-card>
        </q-card-section>
        <template #action>
          <q-btn
            v-close-popup
            flat
            color="black"
            :label="$gettext('Cancel')"
            @click="$emit('closed')"
          />
        </template>
      </q-banner>

      <q-card-section class="row items-center">
        <div class="text-h5">
          {{ $gettext('User with sufficient privileges on the server') }}
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
            @keyup.enter="register"
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
          icon="mdi-server-plus"
          color="positive"
          :disabled="!isValid"
          :label="$gettext('Register')"
          @click="register"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useComputerStore } from 'src/stores/computer'
import { useProgramStore } from 'src/stores/program'

export default {
  name: 'Register',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['closed'],
  setup(props, { emit }) {
    const computerStore = useComputerStore()
    const programStore = useProgramStore()

    const username = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const showing = ref(props.value)

    const { project } = storeToRefs(computerStore)

    const isValid = computed(
      () => username.value !== '' && password.value !== ''
    )

    const register = async () => {
      if (username.value && password.value) {
        await computerStore.registerComputer({
          user: username.value,
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
      }
    )

    return {
      username,
      password,
      showPassword,
      showing,
      isValid,
      project,
      host: programStore.host,
      serverVersion: programStore.serverVersion,
      register,
    }
  },
}
</script>
