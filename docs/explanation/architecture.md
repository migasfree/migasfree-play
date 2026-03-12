# Architecture Explanation

This document explains the high-level design and concepts behind **Migasfree Play**.

> **Note**: For a developer setup guide, see [Developer Onboarding](../tutorials/onboarding.md). For a technical reference of IPC channels and variables, see [Technical Reference](../reference/technical.md).

---

## 🏛️ High-Level Design

The application follows the **Electron process model**, separating system-level operations from user interface rendering.

```mermaid
flowchart TB
    subgraph Electron["Electron Main Process"]
        EM[electron-main.js]
        IPC[IPC Handlers]
    end

    subgraph Renderer["Renderer Process Vue/Quasar"]
        PRELOAD[electron-preload.js]
        VUE[Vue 3 App]

        subgraph Stores["Pinia Stores"]
            PROGRAM[program]
            StoresList[...Other modules]
        end
    end

    subgraph External["External Services"]
        MIGASFREE[Migasfree Server]
        CLIENT[migasfree-client CLI]
    end

    EM --> IPC
    VUE <--> PRELOAD
    PRELOAD <--> IPC
    Stores --> IPC
    Stores --> MIGASFREE
    StoresList --> CLIENT
```

## 🧠 State Orchestration (Pinia)

Instead of a single monolithic state, the application uses **modular Pinia stores** to manage different domain logic areas. The `program` store acts as the main orchestrator, managing the initialization sequence and error states.

### Initialization Sequence

The application follows a strict parallel initialization flow to ensure data consistency:

1. **Environment & Preferences**: Load environment variables and user settings.
2. **Client Identification**: Discover Migasfree Client version and server protocol.
3. **Authentication**: Secure Token verification or request.
4. **Computer Identity**: Retrieve CID (Computer ID) and system characteristics.
5. **Parallel Loading**: Asset loading of Apps, Devices, Tags, and Packages.

## 📡 Secure IPC Bridge

To ensure security, the renderer process has **zero access** to Node.js APIs. Communication with the system is handled through a secure `contextBridge` in `electron-preload.js`, which exposes a limited and sanitized API to the Vue application.

For more details on the specific channels available, see the [Technical Reference](../reference/technical.md#ipc-channels).

---

_Back to [README.md](../../README.md)_
