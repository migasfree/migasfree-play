<template>
  <q-dialog v-model="showing" persistent>
    <q-card>
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
          @click="$emit('canceled')"
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
export default {
  name: 'Login',
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      showing: this.value
    }
  },
  computed: {
    isValid() {
      return this.username !== '' && this.password !== ''
    }
  },
  watch: {
    value(newVal) {
      this.showing = newVal
    }
  },
  methods: {
    login() {
      if (this.username && this.password) {
        this.$store.dispatch('app/checkUser', {
          user: this.username,
          password: this.password
        })
      }
    }
  }
}
</script>
