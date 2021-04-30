let { PythonShell } = require('python-shell')

const express = require('express')
const router = express.Router()

PythonShell.defaultOptions = { pythonPath: '/usr/bin/python3' }

router.post('/check', (req, res) => {
  const code = `
import os
import sys
import platform

user = '${req.body.user}'
password = '${req.body.password}'
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
        hand = open('/etc/shadow')
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

  PythonShell.runString(code, null, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    console.log(code, results)
    res.send({ is_privileged: results[0] })
  })
})

module.exports = router
