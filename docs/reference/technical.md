# Technical Reference

This document provides a descriptive technical record of the project's components and configuration.

## 📁 Directory Structure

```text
migasfree-play/
├── 📦 src-electron/           # Electron main process
│   ├── electron-main.js       # Window, IPC, CLI spawn
│   ├── electron-preload.js    # Secure bridge renderer ↔ main
│   ├── handlers/              # IPC Handlers
│   ├── resources/             # Static resources
│   │   └── scripts/           # Python scripts (.py)
│   └── python-utils.js        # Python execution utilities
│
├── 🎨 src/                    # Renderer process (Vue/Quasar)
│   ├── boot/                  # App initialization (axios, i18n)
│   ├── stores/                # Pinia Stores (Business Logic)
│   ├── pages/                 # Main views
│   ├── components/            # Reusable components
│   └── i18n/                  # Translations (5 languages)
│
├── 🧪 test/                   # Unit tests
└── 📋 packaging/              # Debian/RPM packaging
```

## 📡 IPC Channels

| Channel                       | Type   | Description                            |
| ----------------------------- | ------ | -------------------------------------- |
| `app:get-env-config`          | invoke | Get MFP\_\* environment variables      |
| `app:get-platform`            | invoke | Get OS platform (linux/win32)          |
| `app:get-sync-after-start`    | invoke | Check if --sync-after-start is enabled |
| `app:set-can-exit`            | send   | Toggle window close prevention         |
| `window:show`                 | invoke | Force show the application window      |
| `preferences:read`            | invoke | Read `settings.json` file              |
| `preferences:write`           | invoke | Write to `settings.json` file          |
| `preferences:get-server-info` | invoke | Get server URL from migasfree-client   |
| `token:request`               | invoke | Get authentication token from server   |
| `command:spawn`               | send   | Execute `migasfree` system command     |
| `command:kill`                | send   | Terminate running command process      |

## 🔐 Environment Variables

| Variable               | Description                        | Default          |
| ---------------------- | ---------------------------------- | ---------------- |
| `MFP_USER`             | Username for server authentication | `migasfree-play` |
| `MFP_PASSWORD`         | Password for server authentication | `migasfree-play` |
| `MFP_EXECUTIONS_LIMIT` | Concurrent executions limit (int)  | `5`              |
| `MFP_QUASAR_PORT`      | Dev server port (Development only) | `9999`           |

## 🧭 UI Navigation Icons

| Icon | Section         | Description                    |
| ---- | --------------- | ------------------------------ |
| ⠿    | **Apps**        | The application catalog.       |
| 🖨️   | **Devices**     | Hardware and peripherals.      |
| 🏷️   | **Tags**        | Computer categories/tags.      |
| 📋   | **Details**     | Execution logs and details.    |
| ℹ️   | **Info**        | System and server information. |
| ⚙️   | **Preferences** | Application settings.          |

## 📋 Packaging

### Debian/Ubuntu

```bash
sudo apt install devscripts build-essential debhelper
yarn build
cd packaging
DEB_BUILD_OPTIONS=noautodbgsym debuild --no-lintian --no-tgz-check -us -uc
```

### RPM (Fedora/RHEL)

```bash
yarn build
cd packaging/rpm
./create-package
```

### Arch Linux

```bash
cd packaging
makepkg
```

## 🚀 Production Usage

| Mode           | Command                     |
| -------------- | --------------------------- |
| Normal         | `sudo migasfree-play`       |
| Immediate Sync | `sudo migasfree-play sync`  |
| Debug Mode     | `sudo migasfree-play debug` |

## ⚙️ Settings Schema

File location: `~/.migasfree-play/settings.json` (usually `/root/.migasfree-play/` when running with sudo)

| Key                 | Description                      | Type    |
| ------------------- | -------------------------------- | ------- |
| `language`          | App locale (e.g., `es_ES`)       | string  |
| `dark_mode`         | Dark theme toggle                | boolean |
| `show_sync_details` | Show detailed logs in sync       | boolean |
| `show_*`            | Toggle visibility of UI sections | boolean |

## 🌐 Available Languages

- English (en_US)
- Español (es_ES)
- Français (fr_FR)
- Català (ca_ES)
- Euskara (eu_ES)
- Galego (gl_ES)

---

_Back to [README.md](../../README.md)_
