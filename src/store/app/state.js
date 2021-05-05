export default function() {
  return {
    protocol: '',
    host: '',
    initialUrl: {
      baseDomain: '',
      public: '',
      token: ''
    },
    tokenValue: '',
    tokenChecked: false,
    serverVersion: '',
    apps: [],
    user: {
      isPrivileged: false
    },
    status: ''
  }
}
