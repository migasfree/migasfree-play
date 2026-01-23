# Troubleshooting How-to Guides

This document helps you solve specific problems encountered while using or developing **migasfree-play**.

> **Note**: For general usage, see [USER_GUIDE.md](USER_GUIDE.md). For technical architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## ❌ How to fix "Server Connection Failed"

If the application cannot connect to the Migasfree server:

1. **Check Network**: Ensure you have an active internet connection.
2. **Verify Configuration**: Check `/etc/migasfree.conf` for the correct server URL. See [REFERENCE.md](REFERENCE.md) for more details.
3. **Check Proxy**: If you are behind a corporate proxy, ensure system proxy settings are correctly configured.

## ❌ How to solve certificate errors

1. For development, the `--ignore-certificate-errors` flag is automatically applied when running `yarn dev`.
2. For production, ensure your server has a valid certificate from a trusted CA.

## ❌ How to fix "Insecure Credentials" warning

1. The application warns if it is using default credentials.
2. **Solution**: Set the `MFP_USER` and `MFP_PASSWORD` environment variables in your environment. See [REFERENCE.md](REFERENCE.md) for variable names.

## ❌ How to resolve "Permissions Denied"

1. Most actions require `sudo` or specific Migasfree privileges.
2. Ensure the running user is in the appropriate system groups.

---

_Back to [README.md](../README.md)_
