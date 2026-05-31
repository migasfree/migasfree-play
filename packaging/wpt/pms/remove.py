import os
import sys

APP_PATHS_KEY = r'SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths'
EXE_NAME = 'migasfree-play.exe'
SHORTCUT_NAME = 'migasfree-play.lnk'


def remove_from_registry(exe_name: str) -> bool:
    """Removes the executable from the Windows App Paths registry."""
    if sys.platform != 'win32':
        return True

    import winreg

    try:
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, APP_PATHS_KEY, 0, winreg.KEY_ALL_ACCESS) as key:
            try:
                winreg.DeleteKey(key, exe_name)
                print(f"Successfully removed '{exe_name}' from Windows App Paths.")
            except FileNotFoundError:
                print(f"'{exe_name}' was not found in App Paths (or already removed).")
            except PermissionError:
                print(
                    f"Permission denied: Unable to delete '{exe_name}' from App Paths. Run as Administrator.",
                    file=sys.stderr,
                )
                return False
    except Exception as e:
        print(f'Error opening Registry App Paths: {e}', file=sys.stderr)
        return False

    return True


def remove_start_menu_shortcut() -> bool:
    """Removes the Windows Start Menu desktop shortcut for all users."""
    if sys.platform != 'win32':
        return True

    start_menu_dir = r'C:\ProgramData\Microsoft\Windows\Start Menu\Programs'
    shortcut_path = os.path.join(start_menu_dir, SHORTCUT_NAME)

    if os.path.exists(shortcut_path):
        try:
            os.remove(shortcut_path)
            print('Successfully removed launcher from Windows Start Menu.')
        except Exception as e:
            print(f'Error removing Start Menu shortcut: {e}', file=sys.stderr)
            return False
    return True


def main():
    success_reg = remove_from_registry(EXE_NAME)
    success_shortcut = remove_start_menu_shortcut()

    if not (success_reg and success_shortcut):
        sys.exit(1)
    sys.exit(0)


if __name__ == '__main__':
    main()
