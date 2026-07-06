/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'

export default defineConfig((ctx) => {
  return {
    // https://v2.quasar.dev/quasar-cli/supporting-ts
    supportTS: false,

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli/boot-files
    boot: ['axios', 'fonts', 'gettext', 'ui-defaults', 'qmarkdown'],

    // https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      'mdi-v7',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      // "roboto-font", // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      vueRouterMode: 'history', // available values: 'hash', 'history'

      alias: {
        config: fileURLToPath(new URL('./src/config', import.meta.url)),
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      server: {
        type: 'http',
      },
      port: process.env.MFP_QUASAR_PORT || 9999,
      open: true, // opens browser window automatically
      client: {
        overlay: false,
      },
    },

    eslint: {
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      config: {},

      iconSet: 'material-icons', // Quasar icon set
      lang: 'en-US', // Quasar language pack

      // For special cases outside of where "auto" importStrategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['Notify', 'Dialog', 'Meta', 'LocalStorage'],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // should you wish to change default files
    // (notice no extension, so it resolves to both .js and .ts)
    sourceFiles: {
      electronMain: 'src-electron/electron-main',
    },

    // https://v2.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      // prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      maxAge: 1000 * 60 * 60 * 24 * 30,
      // Tell browser when a file from the server should expire from cache (in ms)

      middlewares: [
        ctx.prod ? 'compression' : '',
        'render', // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'builder', // 'packager' or 'builder'
      preloadScripts: ['electron-preload'],

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        appBundleId: 'org.migasfree.migasfree-play',
        appCategoryType: 'System',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        appId: 'org.migasfree.migasfree-play',
        // icon: 'public/img/migasfree-play.svg',
        compression: 'maximum',
        asar: true,
        linux: {
          target: ['dir'],
          category: 'System',
        },
        win: {
          target: process.env.WPT_BUILD ? ['dir'] : ['nsis', 'msi'],
        },
        nsis: {
          perMachine: true,
          runAfterFinish: false,
        },
        msi: {
          perMachine: true,
          runAfterFinish: false,
        },

        extraResources: [
          {
            from: 'src-electron/resources/scripts',
            to: 'app/scripts',
            filter: ['**/*.py'],
          },
        ],
      },

      /* Extend the Esbuild config that is used for the electron-main thread */
      // extendElectronMainConf(cfg) {
      //   // do nothing
      // },
    },
  }
})
