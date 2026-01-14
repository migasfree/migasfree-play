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
    import ctypes
    import ctypes.util
    import re

    def pam_auth(username, password):
        path = ctypes.util.find_library("pam")
        if not path:
            return False

        try:
            libpam = ctypes.CDLL(path)
        except OSError:
            return False

        class PamHandle(ctypes.Structure):
            pass

        class PamMessage(ctypes.Structure):
            _fields_ = [("msg_style", ctypes.c_int),
                        ("msg", ctypes.c_char_p)]

        class PamResponse(ctypes.Structure):
            _fields_ = [("resp", ctypes.c_char_p),
                        ("resp_retcode", ctypes.c_int)]

        class PamConv(ctypes.Structure):
            _fields_ = [("conv", ctypes.CFUNCTYPE(ctypes.c_int,
                                                  ctypes.c_int,
                                                  ctypes.POINTER(ctypes.POINTER(PamMessage)),
                                                  ctypes.POINTER(ctypes.POINTER(PamResponse)),
                                                  ctypes.c_void_p)),
                        ("appdata_ptr", ctypes.c_void_p)]

        def conversation(num_msg, msg, resp, appdata_ptr):
            response = (PamResponse * num_msg)()
            for i in range(num_msg):
                response[i].resp_retcode = 0
                response[i].resp = password.encode('utf-8')
            resp[0] = response
            return 0

        CONV_FUNC = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_int,
                                     ctypes.POINTER(ctypes.POINTER(PamMessage)),
                                     ctypes.POINTER(ctypes.POINTER(PamResponse)),
                                     ctypes.c_void_p)

        pam_start = libpam.pam_start
        pam_start.restype = ctypes.c_int
        pam_start.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.POINTER(PamConv), ctypes.POINTER(ctypes.POINTER(PamHandle))]

        pam_authenticate = libpam.pam_authenticate
        pam_authenticate.restype = ctypes.c_int
        pam_authenticate.argtypes = [ctypes.POINTER(PamHandle), ctypes.c_int]

        pam_end = libpam.pam_end
        pam_end.restype = ctypes.c_int
        pam_end.argtypes = [ctypes.POINTER(PamHandle), ctypes.c_int]

        handle = ctypes.POINTER(PamHandle)()
        conv = PamConv(CONV_FUNC(conversation), 0)

        retval = pam_start(b"login", username.encode('utf-8'), ctypes.byref(conv), ctypes.byref(handle))

        if retval == 0:
            retval = pam_authenticate(handle, 0)
            pam_end(handle, retval)

        return retval == 0

    import grp
    import pwd

    def is_sudo_group(user_):
        try:
            sudo_gid = grp.getgrnam('sudo').gr_gid
            user_groups = [g.gr_gid for g in grp.getgrall() if user_ in g.gr_mem]
            user_pw = pwd.getpwnam(user_)
            if user_pw.pw_gid == sudo_gid or sudo_gid in user_groups:
                return True
        except KeyError:
            pass
        return False

    def is_root(user_):
        try:
            return pwd.getpwnam(user_).pw_uid == 0
        except KeyError:
            pass
        return False

    is_privileged = pam_auth(user, password) and (is_sudo_group(user) or is_root(user))

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
