/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli/quasar-conf-js

const ESLintPlugin = require('eslint-webpack-plugin')

const { configure } = require('quasar/wrappers')

const path = require('path')

module.exports = configure(function (ctx) {
  return {
    // https://v2.quasar.dev/quasar-cli/supporting-ts
    supportTS: false,

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli/boot-files
    boot: ['axios', 'gettext', 'fonts'],

    // https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      'mdi-v5',
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
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js', 'vue'] }])
        chain.resolve.alias.set(
          'config',
          path.resolve(__dirname, './src/config')
        )
      },

      extendWebpack(cfg, { isServer, isClient }) {
        cfg.externals = {
          ...cfg.externals,
          os: 'require("os")',
          fs: 'require("fs")',
          path: 'require("path")',
          child_process: 'require("child_process")',
          timers: 'require("timers")',
          qrcode: 'require("qrcode")',
        }
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      server: {
        type: 'http',
      },
      port: 9999,
      open: true, // opens browser window automatically
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
      plugins: ['Notify', 'Dialog', 'Meta'],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

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

      // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
      // if using workbox in InjectManifest mode
      chainWebpackCustomSW(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },

      manifest: {
        name: `Migasfree Play`,
        short_name: `Migasfree Play`,
        description: `Migasfree Client front-end. Allow install/uninstall available applications and printers.`,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
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
        // includeSubNodeModules: true,
        asar: false,
        // asarUnpack: [
        //   'api.js',
        //   '**/node_modules/accepts/**/*.js',
        //   '**/node_modules/array-flatten/**/*.js*',
        //   '**/node_modules/body-parser/**/*.js',
        //   '**/node_modules/bytes/**/*.js',
        //   '**/node_modules/cookie/**/*.js',
        //   '**/node_modules/cookie-signature/**/*.js',
        //   '**/node_modules/content-disposition/**/*.js',
        //   '**/node_modules/content-type/**/*.js',
        //   '**/node_modules/cors/**/*.js*',
        //   '**/node_modules/debug/**/*.js*',
        //   '**/node_modules/depd/**/*.js',
        //   '**/node_modules/destroy/**/*.js',
        //   '**/node_modules/ee-first/**/*.js',
        //   '**/node_modules/encodeurl/**/*.js',
        //   '**/node_modules/escape-html/**/*.js',
        //   '**/node_modules/etag/**/*.js',
        //   '**/node_modules/express/**/*.js',
        //   '**/node_modules/finalhandler/**/*.js',
        //   '**/node_modules/forwarded/**/*.js',
        //   '**/node_modules/fresh/**/*.js',
        //   '**/node_modules/fs/**/*.js',
        //   '**/node_modules/http/**/*.js',
        //   '**/node_modules/http-errors/**/*.js',
        //   '**/node_modules/iconv-lite/**/*.js*',
        //   '**/node_modules/ipaddr.js/**/*.js*',
        //   '**/node_modules/inherits/**/*.js*',
        //   '**/node_modules/media-typer/**/*.js',
        //   '**/node_modules/merge-descriptors/**/*.js',
        //   '**/node_modules/methods/**/*.js',
        //   '**/node_modules/mime/**/*',
        //   '**/node_modules/mime-db/**/*.js*',
        //   '**/node_modules/mime-types/**/*.js',
        //   '**/node_modules/ms/**/*.js',
        //   '**/node_modules/negotiator/**/*.js',
        //   '**/node_modules/net/**/*.js',
        //   '**/node_modules/object-assign/**/*.js',
        //   '**/node_modules/on-finished/**/*.js',
        //   '**/node_modules/parseurl/**/*.js',
        //   '**/node_modules/path/**/*.js',
        //   '**/node_modules/path-to-regexp/**/*.js',
        //   '**/node_modules/proxy-addr/**/*.js',
        //   '**/node_modules/python-shell/**/*.js',
        //   '**/node_modules/qs/**/*.js*',
        //   '**/node_modules/querystring/**/*.js',
        //   '**/node_modules/range-parser/**/*.js',
        //   '**/node_modules/raw-body/**/*.js',
        //   '**/node_modules/safe-buffer/**/*.js',
        //   '**/node_modules/safer-buffer/**/*.js*',
        //   '**/node_modules/send/**/*.js',
        //   '**/node_modules/serve-static/**/*.js',
        //   '**/node_modules/setprototypeof/**/*.js',
        //   '**/node_modules/statuses/**/*.js*',
        //   '**/node_modules/stream/**/*.js*',
        //   '**/node_modules/toidentifier/**/*.js*',
        //   '**/node_modules/type-is/**/*.js',
        //   '**/node_modules/util/**/*.js',
        //   '**/node_modules/utils-merge/**/*.js',
        //   '**/node_modules/unpipe/**/*.js',
        //   '**/node_modules/vary/**/*.js',
        // ],
        linux: {
          target: 'deb',
          category: 'System',
          // executableName: "migasfree-play",
          desktop: {
            Name: 'Migasfree Play',
            // Exec: "migasfree-play --no-sandbox"
          },
        },
        deb: {
          depends: ['migasfree-client (>= 5.0)', 'sudo', 'bash', 'cron'],
          packageCategory: 'utils',
          priority: 'optional',
        },
        win: {
          target: ['nsis', 'msi'],
        },
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackMain(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackPreload(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },

      extendWebpackMain(cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
        cfg.entry.api = [path.join(__dirname, 'src', 'api', 'index.js')]
        cfg.output.filename = '[name].js'
      },
    },
  }
})
