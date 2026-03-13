import { useGettext } from 'vue3-gettext'

export const APP_ICON = {
  // Navigation & Menu
  apps: 'mdi-view-grid-outline',
  devices: 'mdi-printer',
  tags: 'mdi-tag',
  details: 'mdi-script-text-outline',
  info: 'mdi-information',
  preferences: 'mdi-cog',
  devices_settings: 'mdi-printer-settings',
  help: 'mdi-help-circle-outline',
  organization: 'mdi-bank',
  identification: 'mdi-card-account-details-outline',
  menu: 'mdi-menu',
  close: 'mdi-close',

  // Actions
  synchronize: 'mdi-play',
  sync: 'mdi-sync',
  register: 'mdi-server-plus',
  install: 'mdi-download',
  uninstall: 'mdi-delete',
  remove: 'mdi-delete',
  privileged: 'mdi-wizard-hat',
  unlock: 'mdi-wizard-hat',
  lock: 'mdi-lock',
  auth: 'mdi-shield-lock-outline',
  login: 'mdi-login',
  search: 'mdi-magnify',
  clear: 'mdi-close-circle',
  stop: 'mdi-stop',
  cancel: 'mdi-close-circle-outline',
  communicate: 'mdi-comment-processing',
  'set-tags': 'mdi-cog-transfer',
  download: 'mdi-cloud-download',
  copy: 'mdi-content-copy',
  star: 'mdi-star',
  link: 'mdi-link-variant',
  heart: 'mdi-heart',
  retry: 'mdi-reload',
  software: 'mdi-package-variant',
  cid: 'mdi-pound',
  domain: 'mdi-domain',
  search_off: 'mdi-magnify-close',

  // Status & Feedback
  success: 'mdi-check-circle-outline',
  installed: 'mdi-check-circle-outline',
  check: 'mdi-check',
  warning: 'mdi-alert-outline',
  error: 'mdi-alert-circle-outline',
  bug: 'mdi-bug',
  info_outline: 'mdi-information-outline',
  clock: 'mdi-clock-outline',
  show: 'mdi-eye',
  hide: 'mdi-eye-off',
  dark: 'mdi-weather-night',
  light: 'mdi-weather-sunny',
  language: 'mdi-translate',
  up: 'mdi-chevron-up',
  down: 'mdi-chevron-down',
  user: 'mdi-account-outline',
  lock_outline: 'mdi-lock-outline',
  server: 'mdi-server',
}

export const ELEMENT_ICON = {
  intended: 'mdi-heart-pulse',
  available: 'mdi-cart',
  'in repair': 'mdi-wrench',
  reserved: 'mdi-lock-clock',
  unsubscribed: 'mdi-recycle-variant',
  unknown: 'mdi-crosshairs-question',
}

export const MODEL_ICON = {
  computers: 'mdi-monitor-dashboard',
  projects: 'mdi-sitemap',
  attributes: 'mdi-pound',
  tags: 'mdi-tag-outline',
}

export const TECH_ICON = {
  usb: 'mdi-usb-port',
  network: 'mdi-server-network',
  printer: 'mdi-printer',
  ram: 'mdi-memory',
  disk: 'mdi-harddisk',
  computer: 'mdi-desktop-classic',
  ip: 'mdi-ip-network',
  mac: 'mdi-swap-vertical',
  cpu: 'mdi-chip',
}

export const PRODUCT_ICONS = {
  desktop: 'mdi-desktop-tower-monitor',
  laptop: 'mdi-laptop',
  virtual: 'mdi-cube-outline',
  docker: 'mdi-docker',
}

/**
 * Get application icon by name.
 * @param {string} item - Icon identifier
 * @returns {string} Material Design Icon class name
 */
export const appIcon = (item) => {
  if (item in APP_ICON) return APP_ICON[item]
  return ''
}

/**
 * Get technology icon by name.
 * @param {string} item - Icon identifier
 * @returns {string} Material Design Icon class name
 */
export const techIcon = (item) => {
  if (item in TECH_ICON) return TECH_ICON[item]
  return ''
}

/**
 * Get computer status icon by status name.
 * @param {string} status - Computer status identifier
 * @returns {string} Material Design Icon class name
 */
export const elementIcon = (status) => {
  if (status in ELEMENT_ICON) return ELEMENT_ICON[status]
  return ELEMENT_ICON['unknown']
}

/**
 * Get computer product icon by product system name.
 * @param {string} productSystem - Product system identifier
 * @returns {string} Material Design Icon class name
 */
export const productIcon = (productSystem) => {
  return PRODUCT_ICONS[productSystem] ?? PRODUCT_ICONS['desktop']
}

/**
 * Get CPU icon by architecture.
 * @param {string|number} arch - CPU architecture
 * @returns {string} Material Design Icon class name
 */
export const cpuIcon = (arch) => {
  return [32, 64].includes(arch) ? `mdi-cpu-${arch}-bit` : 'mdi-cpu-64-bit'
}

/**
 * Get icon for a data model.
 * @param {string} model - Model identifier
 * @returns {string} Material Design Icon class name
 */
export const modelIcon = (model) => {
  if (model in MODEL_ICON) return MODEL_ICON[model]
  return ''
}

/**
 * Composable for element utilities (icons).
 * @returns {Object} Element utilities
 */
export const useElement = () => {
  const { $gettext } = useGettext()

  const computerStatus = (status) => {
    const map = {
      available: $gettext('Available'),
      'in repair': $gettext('In repair'),
      reserved: $gettext('Reserved'),
      intended: $gettext('Intended'),
      unsubscribed: $gettext('Unsubscribed'),
    }

    return map[status] ?? $gettext('Unknown')
  }

  return {
    appIcon,
    techIcon,
    modelIcon,
    elementIcon,
    productIcon,
    cpuIcon,
    computerStatus,
  }
}
