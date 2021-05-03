# Migasfree Play

Migasfree Client front-end. Allow install/uninstall available applications and printers.

## Install the dependencies

```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
sudo yarn dev
```

### Extract gettext content

```bash
yarn gettext-extract
```

### Compile gettext content

```bash
yarn gettext-compile
```

### Lint the files

```bash
yarn run lint
```

### Build the app for production

```bash
yarn build
```

### Build the package for Debian/Ubuntu distros

```bash
yarn build
cd packaging
debuild --no-tgz-check -us -uc
```

### Execute app in production

```bash
sudo migasfree-play --no-sandbox
```
