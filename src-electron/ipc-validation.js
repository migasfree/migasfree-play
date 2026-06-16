// Simple regex patterns for validation
const SAFE_ARG_REGEX = /^[a-zA-Z0-9_./+-@:=\s"']*$/
const VERSION_REGEX = /^\d+(\.\d+)*.*$/
const ID_REGEX = /^[a-zA-Z0-9_-]+$/
const INT_OR_EMPTY_REGEX = /^\d*$/

export function validateSpawn(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid spawn payload')
  }
  const { id, command, args, input, env } = payload
  if (typeof id !== 'string' || !ID_REGEX.test(id)) {
    throw new Error('Invalid command ID')
  }
  if (typeof command !== 'string') {
    throw new Error('Command must be a string')
  }
  if (!Array.isArray(args)) {
    throw new Error('Args must be an array')
  }
  for (const arg of args) {
    if (typeof arg !== 'string' || !SAFE_ARG_REGEX.test(arg)) {
      throw new Error(`Forbidden character in command argument: "${arg}"`)
    }
  }
  if (input !== undefined && typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  if (env !== undefined && (typeof env !== 'object' || env === null)) {
    throw new Error('Env must be an object')
  }
}

export function validateVersion(version) {
  if (version !== undefined && version !== null) {
    if (
      typeof version !== 'string' ||
      (version && !VERSION_REGEX.test(version))
    ) {
      throw new Error('Invalid version parameter')
    }
  }
}

export function validatePackages(packages) {
  if (!Array.isArray(packages)) {
    throw new Error('Packages parameter must be an array')
  }
  for (const pkg of packages) {
    if (typeof pkg !== 'string' || !SAFE_ARG_REGEX.test(pkg)) {
      throw new Error(`Invalid package name: "${pkg}"`)
    }
  }
}

export function validateCredentials({
  user,
  password,
  username,
  version,
} = {}) {
  if (user !== undefined && typeof user !== 'string') {
    throw new Error('User must be a string')
  }
  if (username !== undefined && typeof username !== 'string') {
    throw new Error('Username must be a string')
  }
  if (password !== undefined && typeof password !== 'string') {
    throw new Error('Password must be a string')
  }
  validateVersion(version)
}

export function validateDeviceId(deviceId) {
  if (deviceId !== undefined && deviceId !== null) {
    const s = deviceId.toString()
    if (!INT_OR_EMPTY_REGEX.test(s)) {
      throw new Error('Device ID must be integer')
    }
  }
}

export function validateDeviceAssignment(logicalId, assigned) {
  if (logicalId === undefined || logicalId === null) {
    throw new Error('Logical ID is required')
  }
  const s = logicalId.toString()
  if (!INT_OR_EMPTY_REGEX.test(s)) {
    throw new Error('Logical ID must be integer')
  }
  if (assigned !== undefined && typeof assigned !== 'boolean') {
    throw new Error('Assigned must be a boolean')
  }
}

export function validatePreferencesContent(content) {
  if (!content || typeof content !== 'object') {
    throw new Error('Preferences content must be an object')
  }
}

export function validateTokenRequest(url, username, password) {
  if (typeof url !== 'string') {
    throw new Error('URL must be a string')
  }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('URL protocol must be http or https')
    }
  } catch {
    throw new Error('Invalid URL')
  }
  if (
    username !== undefined &&
    username !== null &&
    typeof username !== 'string'
  ) {
    throw new Error('Username must be a string')
  }
  if (
    password !== undefined &&
    password !== null &&
    typeof password !== 'string'
  ) {
    throw new Error('Password must be a string')
  }
}
