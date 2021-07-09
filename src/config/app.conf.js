export const executionsMaxLength = 5

export const internalApi = 'http://localhost:3000'

export const tokenAuth = {
  url: '/token-auth/'
}

export const checkTokenApi = {
  url: '/rest-auth/user/'
}

export const publicApi = {
  prefix: '/api/v1/public',
  serverInfo: '/server/info/'
}

export const tokenApi = {
  prefix: '/api/v1/token',
  apps: '/catalog/apps/available/?cid=',
  categories: '/catalog/categories/',
  computer: '/computers/',
  availableDevices: '/devices/devices/available/?cid=',
  availableLogicalDevices: '/devices/logical/available/?cid=',
  logicalDevice: '/devices/logical/',
  cidAttribute: '/attributes/?property_att__prefix=CID&value='
}
