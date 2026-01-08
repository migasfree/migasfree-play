export const appName = 'Migasfree Play'

export const executionsMaxLength = process.env.MFP_EXECUTIONS_LIMIT || 5

export const internalApi = `http://localhost:${
  process.env.MFP_EXPRESS_PORT || 3000
}`

export const urlHelp =
  'https://fun-with-migasfree.readthedocs.io/es/master/chapter10.html#migasfree-play'

export const tokenAuth = {
  url: '/token-auth/',
}

export const checkTokenApi = {
  url: '/rest-auth/user/',
}

export const publicApi = {
  prefix: '/api/v1/public',
  serverInfo: '/server/info/',
}

export const tokenApi = {
  prefix: '/api/v1/token',
  apps: '/catalog/apps/available/?cid=',
  categories: '/catalog/categories/',
  computer: '/computers/',
  availableDevices: '/devices/devices/available/?cid=',
  deviceData: '/devices/devices/',
  logicalDevice: '/devices/logical/',
  cidAttribute: '/attributes/?property_att__prefix=CID&value=',
}

export const tokenApiv4 = {
  categories: '/catalog/apps/categories/',
}

export const minimumClientVersion = '4.20'

export const resultsPerPage = 10

export const retryIntervalSeconds = 10
