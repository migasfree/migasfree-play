<template>
  <div id="q-app">
    <div
      v-if="$store.state.ui.isLoading"
      class="window-height window-width row justify-center items-center content-center"
    >
      <q-spinner color="primary" size="8em" />
      <div>{{ $gettext('Loading data...') }}</div>
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
