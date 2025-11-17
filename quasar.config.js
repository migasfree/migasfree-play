/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js

import ESLintPlugin from 'eslint-webpack-plugin'
import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export default defineConfig((ctx) => {
  return {
    // https://v2.quasar.dev/quasar-cli/supporting-ts
    supportTS: false,

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli/boot-files
    boot: ['axios', 'fonts', 'gettext'],

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

      // transpile: false,
      // publicPath: '/',

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: true, // https://v2.quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://v2.quasar.dev/quasar-cli/handling-webpack
      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain

      chainWebpack(chain) {
        chain.resolve.alias.set(
          'config',
          fileURLToPath(new URL('./src/config', import.meta.url)),
        )
      },

      extendWebpack(cfg) {
        cfg.externals = {
          ...cfg.externals,
          os: 'commonjs os',
          fs: 'commonjs fs',
          path: 'commonjs path',
          child_process: 'commonjs child_process',
          timers: 'commonjs timers',
          qrcode: 'commonjs qrcode',
        }
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
      // fix: true,
      // include: [],
      // exclude: [],
      // cache: false,
      // rawEsbuildEslintOptions: {},
      // rawWebpackEslintPluginOptions: {},
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

      chainWebpackWebserver(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },

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
        asar: false,
        linux: {
          target: ['dir'],
          category: 'System',
        },
        win: {
          target: ['nsis', 'msi'],
        },
        nsis: {
          perMachine: true,
          runAfterFinish: false,
        },
        msi: {
          perMachine: true,
          runAfterFinish: false,
        },
      },

      /* Extend the Esbuild config that is used for the electron-main thread */
      extendElectronMainConf(cfg) {
        cfg.entryPoints = [
          {
            in: path.join(
              fileURLToPath(new URL('.', import.meta.url)),
              'src',
              'api',
              'index.js',
            ),
            out: ctx.prod
              ? path.join(
                  fileURLToPath(new URL('.', import.meta.url)),
                  'dist',
                  'electron',
                  'UnPackaged',
                  'api',
                )
              : path.join(
                  fileURLToPath(new URL('.', import.meta.url)),
                  '.quasar',
                  'dev-electron',
                  'api',
                ),
          },
          {
            in: path.join(
              fileURLToPath(new URL('.', import.meta.url)),
              'src-electron',
              'electron-main',
            ),
            out: ctx.prod
              ? path.join(
                  fileURLToPath(new URL('.', import.meta.url)),
                  'dist',
                  'electron',
                  'UnPackaged',
                  'electron-main',
                )
              : path.join(
                  fileURLToPath(new URL('.', import.meta.url)),
                  '.quasar',
                  'dev-electron',
                  'electron-main',
                ),
          },
        ]
        cfg.outdir = ctx.prod
          ? path.join(
              fileURLToPath(new URL('.', import.meta.url)),
              'dist',
              'electron',
              'UnPackaged',
            )
          : path.join(
              fileURLToPath(new URL('.', import.meta.url)),
              '.quasar',
              'dev-electron',
            )
        delete cfg.outfile
      },
    },
  }
})
