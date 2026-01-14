import express from 'express'
import { pythonExecute, debug } from '../utils.js'

const router = express.Router()

router.post('/check', async (req, res) => {
  if (debug) console.log('[express] Checking user...')

  const code = `
import os
import sys
import platform

user = sys.argv[1]
password = sys.argv[2]
is_privileged = False

if platform.system() == "Windows":
    import win32security
    import ctypes

    domain = os.environ['userdomain']
    try:
        hUser = win32security.LogonUser(
            user,
            domain,
            password,
            win32security.LOGON32_LOGON_NETWORK,
            win32security.LOGON32_PROVIDER_DEFAULT
        )
    except win32security.error:
        is_privileged = False
    else:
        if ctypes.windll.shell32.IsUserAnAdmin() == 1:  # is an admin
            is_privileged = True
        else:
            is_privileged = False
elif platform.system() == "Linux":
    import crypt
    import re

    def auth(user_, password_):
        try:
            hand = open('/etc/shadow')
        except PermissionError:
            return False

        for line in hand:
            x = re.findall('^%s:' % user_, line)
            if len(x):
                salt = line.split(":")[1]
                if crypt.crypt(password_, salt) == salt:
                    return True

        return False

    def is_sudo_group(user_):
        hand = open('/etc/group')
        for line in hand:
            x = re.findall('^sudo:', line)
            if len(x):
                for element in line.split(":")[3].split(","):
                    if element.rstrip() == user_:
                        return True

        return False

    def is_root(user_):
        hand = open('/etc/passwd')
        for line in hand:
            x = re.findall('^%s:' % user_, line)
            if len(x):
                if line.split(":")[2] == "0":
                    return True

        return False

    is_privileged = auth(user, password) and (is_sudo_group(user) or is_root(user))

print(is_privileged)
`

  try {
    const results = await pythonExecute(
      res,
      code,
      [req.body.username, req.body.password],
      'application/json',
    )
    res.send({ is_privileged: results === 'True' })
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ is_privileged: false })
  }
})

export default router
