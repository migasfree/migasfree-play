<template>
  <div id="q-app">
    <div
      v-if="$store.state.ui.isLoading"
      class="row window-height window-width justify-center items-center content-center"
    >
      <div class="col-12 text-center q-ma-md">
        <img id="logo" src="img/migasfree-play.svg" width="200" />
      </div>

      <div class="col-12 text-center">
        <q-spinner-clock color="primary" size="6em" />
      </div>

      <div class="col-12 text-center q-mt-md">
        {{ $gettext('Loading data') }}: {{ $store.getters['app/status'] }}
      </div>
    </div>

    <router-view v-else />
  </div>
</template>

<script>
export default {
  name: 'App',
  async created() {
    await this.$store.dispatch('app/init')
  }
}
</script>
