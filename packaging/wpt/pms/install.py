import os
import sys
import subprocess

APP_PATHS_BASE = r'SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths'
EXE_NAME = 'migasfree-play.exe'
SHORTCUT_NAME = 'migasfree-play.lnk'


def register_in_app_paths(exe_path: str, install_dir: str) -> bool:
    """Registers the executable in Windows App Paths for global shell execution."""
    if sys.platform != 'win32':
        return True

    import winreg

    app_paths_key = f'{APP_PATHS_BASE}\\{EXE_NAME}'
    try:
        with winreg.CreateKey(winreg.HKEY_LOCAL_MACHINE, app_paths_key) as key:
            winreg.SetValueEx(key, '', 0, winreg.REG_SZ, exe_path)
            winreg.SetValueEx(key, 'Path', 0, winreg.REG_SZ, install_dir)
        print(f"Successfully registered '{EXE_NAME}' in Windows App Paths.")
    except PermissionError:
        print(
            f"Permission denied: Unable to register '{EXE_NAME}' in App Paths. Run as Administrator.",
            file=sys.stderr,
        )
        return False
    except Exception as e:
        print(f'Error writing Registry App Paths: {e}', file=sys.stderr)
        return False

    return True


def create_start_menu_shortcut(exe_path: str, install_dir: str) -> bool:
    """Creates a Windows Start Menu desktop shortcut for all users via PowerShell."""
    if sys.platform != 'win32':
        return True

    start_menu_dir = r'C:\ProgramData\Microsoft\Windows\Start Menu\Programs'
    shortcut_path = os.path.join(start_menu_dir, SHORTCUT_NAME)

    # PowerShell command to create shortcut with icon
    ps_command = (
        f'$WshShell = New-Object -ComObject WScript.Shell; '
        f'$Shortcut = $WshShell.CreateShortcut("{shortcut_path}"); '
        f'$Shortcut.TargetPath = "{exe_path}"; '
        f'$Shortcut.WorkingDirectory = "{install_dir}"; '
        f'$Shortcut.IconLocation = "{exe_path},0"; '
        f'$Shortcut.Save()'
    )

    try:
        subprocess.run(['powershell', '-NoProfile', '-Command', ps_command], check=True, capture_output=True)
        print('Successfully created launcher in Windows Start Menu for all users.')
    except Exception as e:
        print(f'Error creating Start Menu shortcut: {e}', file=sys.stderr)
        return False

    return True


def main():
    install_dir = os.environ.get('WPT_INSTALL_DIR')
    if not install_dir:
        print('Error: WPT_INSTALL_DIR is not set.', file=sys.stderr)
        sys.exit(1)

    exe_path = os.path.join(install_dir, EXE_NAME)
    if not os.path.isfile(exe_path):
        print(f"Error: '{EXE_NAME}' not found at {exe_path}", file=sys.stderr)
        sys.exit(1)

    if not register_in_app_paths(exe_path, install_dir):
        sys.exit(1)

    if not create_start_menu_shortcut(exe_path, install_dir):
        sys.exit(1)

    print('migasfree-play installation completed successfully.')
    sys.exit(0)


if __name__ == '__main__':
    main()
