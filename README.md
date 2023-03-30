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

### Build the package for RPM based distros

```bash
yarn build
cd packaging/rpm
./create-package
```

### Execute app in production

```bash
sudo migasfree-play
```

#### Execute app in production and synchronize computer immediately

```bash
sudo migasfree-play sync
```

#### Execute app in production in debug mode

```bash
sudo migasfree-play debug
ELECTRON_ENABLE_LOGGING=1 sudo migasfree-play debug
```

## Screenshots

![migasfree-play Apps](./screenshots/play-apps.png 'migasfree-play Apps')

![migasfree-play Devices](./screenshots/play-devices.png 'migasfree-play Devices')

![migasfree-play Info](./screenshots/play-info.png 'migasfree-play Info')

## Settings

File: /root/.migasfree-play/settings.json

Default content:

```
{
  "language": "es_ES",
  "show_language": true,
  "show_computer_link": true,
  "show_sync_details": true,
  "show_apps": true,
  "show_devices": true,
  "show_tags": true,
  "show_details": true,
  "show_preferences": true,
  "show_info": true,
  "show_help": true,
  "dark_mode": true,
  "show_dark_mode": true
}
```

### Available languages

* American English (en_US)
* Català (ca_ES)
* Español (es_ES)
* Euskara (eu_ES)
* Galego (gl_ES)

### Environment variables

You can set values ​​for the following environment variables:

```
MFP_USER=migasfree-play
MFP_PASSWORD=migasfree-play

MFP_QUASAR_PORT=9999
MFP_EXPRESS_PORT=3000

MFP_EXECUTIONS_LIMIT=5

MFP_CMD_FLAGS=
```

## Requirements in production

* NodeJS >= 12
* migasfree-client >= 4.20
