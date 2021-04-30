export const executionsMaxLength = 5

export const internalApi = 'http://localhost:3000'

export const tokenAuth = {
  url: '/token-auth/',
  user: 'migasfree-play',
  password: 'migasfree-play'
}

export const publicApi = {
  prefix: '/api/v1/public',
  serverInfo: '/server/info/',
  computerInfo: '/get_computer_info/?uuid='
}

export const tokenApi = {
  prefix: '/api/v1/token',
  apps: '/catalog/apps/available/?cid=',
  categories: '/catalog/apps/categories/',
  computer: '/computers/',
  availableDevices: '/devices/devices/available/?cid=',
  availableLogicalDevices: '/devices/logical/available/?cid=',
  logicalDevice: '/devices/logical/',
  cidAttribute: '/attributes/?property_att__prefix=CID&value='
}
