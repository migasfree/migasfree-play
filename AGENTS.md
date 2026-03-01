# AGENTS.md

> **Context for AI Agents working on `migasfree-play`**
> This file provides the essential context, commands, and conventions for AI agents to work effectively on this project.

## 1. Project Overview

**migasfree-play** is the desktop graphical interface for the Migasfree Systems Management System. It allows end-users to manage software (install/uninstall catalog) and peripherals.

- **Desktop Framework**: Electron 39.x (Main, Preload, and Renderer processes)
- **UI Framework**: Vue 3 + Quasar 2.18 (Webpack)
- **State Management**: Pinia 3.x
- **Language**: JavaScript (ES6 Modules) / Vue SFC
- **System Integration**: Cross-platform (Linux/Windows) through `python-shell` and `migasfree-client`.

## 2. Setup & Commands

Use `yarn` for package management.

- **Install Dependencies**: `yarn install`
- **Start Dev Server**: `yarn dev` (runs `quasar dev -m electron`)
- **Run Unit Tests**: `yarn test` (runs `vitest run`)
- **Build App**: `yarn build` (runs `quasar build -m electron`)
- **Lint Code**: `yarn lint`
- **Format Code**: `yarn format`
- **Extract i18n**: `yarn gettext:extract`
- **Compile i18n**: `yarn gettext:compile`

## 3. Code Style & Conventions

- **Linter**: ESLint with Prettier, Vue, and Security plugins.
- **Formatting**: Prettier is authoritative.
- **Vue Components**: Use Composition API (`<script setup>`) for new features.
- **IPC Architecture**: Use the `src-electron` bridge for communication between the Renderer (Vue) and Main (Electron) processes. No direct Node.js access in the Renderer for security.
- **Internationalization**: Use `vue-gettext` with standard `_()` or `$gettext()` translations.
- **Icons**: Material Design Icons (`mdi-*`).

## 4. Architecture Standards

- **`src/`**: Shared Vue frontend code.
  - `src/components/`: Reusable Vue components.
  - `src/pages/`: Main application views.
  - `src/stores/`: Global state management with Pinia.
- **`src-electron/`**: Electron-specific backend code.
  - `electron-main.js`: Main process managing window lifecycle and system hooks.
  - `electron-preload.js`: The bridge providing secure IPC to the renderer.
- **`packaging/`**: Configuration for Linux (`.deb`) and Windows installers.

## 5. Available Skills & Specialized Constraints

This project is supported by specialized AI Skills in `.agent/skills`. **ALWAYS** check and use these skills:

- **Electron**: `electron-expert` (Security, IPC patterns, window management)
- **UI/UX Design**: `ui-designer-expert` & `migasfree-ui-ux-expert` (Visual language, Quasar components, Glassmorphism)
- **QA & Testing**: `qa-expert` (Vitest, unit testing patterns)
- **Documentation**: `docs-expert` (Diátaxis, ADRs, user guides)
- **Security**: `security-expert` (AppSec, secure IPC)
- **CI/CD & DevOps**: `cicd-expert` (Packaging, GitHub Actions)
- **Output Standards**: `output-standard-expert`

## 6. Critical Rules

1. **Security (IPC)**: NEVER allow direct Node.js access in the Renderer process. Use `contextBridge` in `electron-preload.js`.
2. **Privileges**: Running in development (`yarn dev`) on Linux often requires `sudo` for system client interaction.
3. **Environment**: Use `.env` for development-specific configuration.
4. **Sandboxing**: When building or running, the `--no-sandbox` flags in scripts are currently required for containerized environments.
5. **i18n Integrity**: Ensure that new string literals are correctly wrapped for translation extraction.
