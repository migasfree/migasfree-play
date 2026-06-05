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
6. **Version Updates**: When changing the project version, make sure to also update the version in metadata.json accordingly.

## 7. Client/Server Version Compatibility Matrix

### Valid deployment combinations

| `migasfree-client` | `migasfree-backend` | Notes                                         |
| ------------------ | ------------------- | --------------------------------------------- |
| v4                 | v4                  | Full legacy stack                             |
| v4                 | v5                  | Supported — client cannot use CLI subcommands |
| v5                 | v5                  | Full modern stack                             |
| v5                 | v4                  | **IMPOSSIBLE** — never occurs in production   |

### Two independent axes in Pinia store logic

The conditionals in `src/stores/` must always use the **correct axis**:

#### Axis 1 — How to fetch data: `isLegacyClient` (client version)

Use `isLegacyClient.value` to decide **whether to call Electron IPC or the HTTP API directly**.

- `isLegacyClient = true` (client v4): has no CLI subcommands → must call the server HTTP API directly.
- `isLegacyClient = false` (client v5): has full CLI → use `window.electronAPI.*` (Electron IPC).

```js
// CORRECT
if (isLegacyClient.value) {
  // Direct HTTP API call (works against server v4 or v5)
} else {
  // Electron IPC / CLI (client v5 + server v5 only)
}
```

#### Axis 2 — How to interpret data: `isLegacyServer` / `serverVersion` (server version)

Use `serverVersion.value.startsWith('4.')` (or `isLegacyServer.value`) to decide:

- Which **API endpoint** to call (v4 and v5 may expose different paths for the same resource).
- How to **parse/transform** the response (e.g., `data` field as JSON string on v4 vs parsed object on v5).
- Which **field names** to read (`feature` on v4, `capability` on v5).
- Whether to **deduplicate** results (known bug on v4 servers).

```js
// CORRECT — endpoint selection inside an isLegacyClient branch
if (isLegacyClient.value) {
  const url = serverVersion.value.startsWith('4.')
    ? `${base}${tokenApiv4.someEndpoint}`   // v4-specific path
    : `${base}${tokenApi.someEndpoint}`      // v5 path (used by v4 client against v5 server)
  ...
}

// CORRECT — response transformation, independent of client version
if (serverVersion.value.startsWith('4.')) {
  results = results.map((item) => ({ ...item, data: JSON.parse(item.data) }))
}
```

#### Anti-patterns to avoid

```js
// WRONG — conflates client routing with server format
if (isLegacyClient.value || serverVersion.value.startsWith('4.')) { ... }

// WRONG — assumes server v4 implies client v4 (not always true)
if (serverVersion.value.startsWith('4.')) {
  // Electron IPC bypass — but client v4 + server v5 would never reach IPC anyway
}
```

### Known server v4 vs v5 endpoint differences (`src/config/app.conf.js`)

| Resource   | `tokenApiv4.*`              | `tokenApi.*`           |
| ---------- | --------------------------- | ---------------------- |
| Categories | `/catalog/apps/categories/` | `/catalog/categories/` |

When adding new resources that differ between server versions, extend both `tokenApi` and `tokenApiv4` in `app.conf.js` and apply the selection inside the `isLegacyClient` branch using `serverVersion`.
