export default function () {
  return {
    protocol: '',
    host: '',
    initialUrl: {
      baseDomain: '',
      public: '',
      token: '',
    },
    tokenValue: '',
    tokenChecked: false,
    serverVersion: '',
    organization: '',
    apps: [],
    user: {
      isPrivileged: false,
    },
    status: '',
    stopApp: false,
  }
}
