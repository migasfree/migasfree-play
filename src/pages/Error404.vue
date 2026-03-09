<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div class="text-error-code">404</div>

      <div class="text-h2 text-error-message">Oops. Nothing here...</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<style scoped>
.text-error-code {
  font-size: 30vh;
}
.text-error-message {
  opacity: 0.4;
}
</style>
