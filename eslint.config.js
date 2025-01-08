import js from '@eslint/js'
import globals from 'globals'
import pluginQuasar from '@quasar/app-webpack/eslint'
import pluginVue from 'eslint-plugin-vue'
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    ignores: [
      'src-bex/www/*',
      'src-pwa/*',
      'src-electron/*',
      'babel.config.js',
      '.gitignore',
    ],

    languageOptions: {
      ecmaVersion: 'latest', // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        process: 'readonly', // process.env.*
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly', // BEX related
      },
    },
  },

  ...pluginQuasar.configs.recommended(),
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    rules: {
      'prefer-promise-reject-errors': 'off',
      'vue/no-v-html': 'off',
      'vue/no-v-text-v-html-on-component': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',

      // allow debugger during development only
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },

  {
    files: ['src-pwa/custom-service-worker.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  prettierSkipFormatting,
]
