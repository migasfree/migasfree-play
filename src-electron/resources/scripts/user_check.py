import os
import sys
import platform
import subprocess

try:
    if len(sys.argv) < 3:
        print(False)
        sys.exit(0)

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
                win32security.Logon32_LOGON_NETWORK,
                win32security.Logon32_PROVIDER_DEFAULT
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
        import grp
        import pwd

        # Keep references to prevent GC causing crashes in PAM conversation
        cleanup_refs = []

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
                try:
                    response = (PamResponse * num_msg)()
                    messages = msg
                    
                    for i in range(num_msg):
                        pm = messages[i].contents
                        style = pm.msg_style

                        response[i].resp_retcode = 0
                        response[i].resp = None
                        
                        # PAM_PROMPT_ECHO_OFF = 1 (Password)
                        if style == 1:
                             if isinstance(password, str):
                                 pwd_bytes = password.encode('utf-8')
                             else:
                                 pwd_bytes = password
                             
                             cleanup_refs.append(pwd_bytes)
                             c_pwd = ctypes.c_char_p(pwd_bytes)
                             cleanup_refs.append(c_pwd)
                             response[i].resp = c_pwd
                    
                    cleanup_refs.append(response)
                    resp[0] = response
                    return 0 # PAM_SUCCESS
                except Exception:
                    return 19 # PAM_CONV_ERR

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

            try:
                # Ensure username is encoded properly
                u_enc = username.encode('utf-8')
            except Exception:
                u_enc = str(username).encode('utf-8')
            
            # Use 'sudo' service to avoid TTY requirement of 'login'
            retval = pam_start(b"sudo", u_enc, ctypes.byref(conv), ctypes.byref(handle))

            if retval == 0:
                retval = pam_authenticate(handle, 0)
                pam_end(handle, retval)

            return retval == 0

        def is_admin_group(user_):
            admin_groups = ['sudo', 'wheel', 'root']
            target_gids = []
            for gname in admin_groups:
                try:
                    target_gids.append(grp.getgrnam(gname).gr_gid)
                except KeyError:
                    pass
            
            if not target_gids:
                return False

            try:
                user_pw = pwd.getpwnam(user_)
                user_groups_ids = [user_pw.pw_gid]
                for g in grp.getgrall():
                    if user_ in g.gr_mem:
                        user_groups_ids.append(g.gr_gid)
                
                return bool(set(target_gids) & set(user_groups_ids))
            except KeyError:
                return False

        def is_root(user_):
            try:
                return pwd.getpwnam(user_).pw_uid == 0
            except KeyError:
                pass
            return False

        def check_sudo_auth(user_, password_):
            try:
                import getpass
                cur_user = getpass.getuser()
                
                cmd = []
                if cur_user == 'root' and user_ != 'root':
                    # Running as root, checking another user using su
                    cmd = ['su', user_, '-c', 'sudo -S -v -k']
                elif user_ == cur_user or user_ == 'root' or cur_user == 'root':
                    # Checking self or root
                    cmd = ['sudo', '-S', '-v', '-k']
                else:
                    return False
                
                if isinstance(password_, str):
                    input_bytes = password_.encode('utf-8') + b'\n'
                else:
                    input_bytes = password_ + b'\n'
                
                p = subprocess.run(cmd, input=input_bytes, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
                return p.returncode == 0
            except Exception:
                return False
        
        # 1. Try Sudo Auth first (most reliable, supports bypassing root limitations via su)
        if check_sudo_auth(user, password):
            is_privileged = True
        else:
            # 2. Fallback to PAM + Groups
            is_privileged = pam_auth(user, password) and (is_admin_group(user) or is_root(user))

    print(is_privileged)

except Exception:
    # Always output something valid for JS
    print(False)
