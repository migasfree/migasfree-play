# Troubleshooting How-to Guides

This document helps you solve specific problems encountered while using or developing **migasfree-play**.

> **Note**: For general usage, see [User Guide](user-guide.md). For technical architecture, see [Architecture Explanation](../explanation/architecture.md).

---

## ❌ How to fix "Server Connection Failed"

If the application cannot connect to the Migasfree server:

1. **Check Network**: Ensure you have an active internet connection.
2. **Verify Configuration**: Check `/etc/migasfree.conf` for the correct server URL. See [Technical Reference](../reference/technical.md) for more details.
3. **Check Proxy**: If you are behind a corporate proxy, ensure system proxy settings are correctly configured.

## ❌ How to solve certificate errors

1. For development, the `--ignore-certificate-errors` flag is automatically applied when running `yarn dev`.
2. For production, ensure your server has a valid certificate from a trusted CA.

## ❌ How to fix "Insecure Credentials" warning

1. The application warns if it is using default credentials.
2. **Solution**: Set the `MFP_USER` and `MFP_PASSWORD` environment variables in your environment. See [Technical Reference](../reference/technical.md) for variable names.
3. **Note on Client v5**: If you are working with `migasfree-client` v5 or higher, Mutual TLS (mTLS) is automatically enabled using the system client certificates. In this case, user credentials are completely innocuous, and the "Insecure Credentials" warning is automatically suppressed, so you do not need to configure these variables.

## ❌ How to resolve "Permissions Denied"

1. Most actions require `sudo` or specific Migasfree privileges.
2. Ensure the running user is in the appropriate system groups.

## 🐛 How to debug the migasfree client

By design, all internal and interactive calls from **migasfree-play** to the `migasfree` client are forced to execute with `DEBUG=False` (suppressing the `MIGASFREE_CLIENT_DEBUG` environment variable and `--debug` flags). This strict policy is required to prevent the debug output from corrupting the JSON parsing engine in the Electron app.

If you need to debug the client behavior or inspect server responses:

1. Do not rely on the `migasfree-play` log output.
2. Open a system terminal.
3. Invoke the `migasfree` client directly from the command line (e.g., `sudo migasfree sync -d`).

---

_Back to [README.md](../../README.md)_
