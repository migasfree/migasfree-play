# 🚀 Developer Onboarding Tutorial

This tutorial guides you through setting up your development environment and running **migasfree-play** for the first time.

> **Note**: For a deep dive into how it works, see [ARCHITECTURE.md](ARCHITECTURE.md). For technical details, see [REFERENCE.md](REFERENCE.md).

---

## 🛠️ Step 1: Install Dependencies

Ensure you have Node.js (>= 22.12), Yarn, and Python (>= 3.6) installed.

```bash
# Clone the repository
git clone https://github.com/migasfree/migasfree-play.git
cd migasfree-play

# Install project dependencies
yarn install
```

## 🏃 Step 2: Run in Development Mode

The application requires `sudo` in development to interact with system-level commands correctly.

```bash
sudo yarn dev
```

The application window should appear momentarily.

## 🧪 Step 3: Verify with Tests

Run the unit test suite to ensure everything is working correctly:

```bash
yarn test
```

## 💡 Next Steps

- **Add a feature**: Explore `src/stores/` to see how business logic is handled.
- **Fix a bug**: Check the [Troubleshooting Guide](TROUBLESHOOTING.md).
- **Contribute**: Read our contributing guidelines in [README.md](../README.md).

---

_Back to [README.md](../README.md)_
