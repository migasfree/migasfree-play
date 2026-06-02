import os
import shutil
import subprocess
import sys

APP_PATHS_BASE = r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths"
EXE_NAME = "migasfree-play.exe"
SHORTCUT_NAME = "migasfree-play.lnk"
SHIM_NAME = "migasfree-play.cmd"


def register_in_app_paths(exe_path: str, install_dir: str) -> bool:
    """Registers the executable in Windows App Paths for global shell execution."""
    if sys.platform != "win32":
        return True

    import winreg

    app_paths_key = f"{APP_PATHS_BASE}\\{EXE_NAME}"
    try:
        with winreg.CreateKey(winreg.HKEY_LOCAL_MACHINE, app_paths_key) as key:
            winreg.SetValueEx(key, "", 0, winreg.REG_SZ, exe_path)
            winreg.SetValueEx(key, "Path", 0, winreg.REG_SZ, install_dir)
        print(f"Successfully registered '{EXE_NAME}' in Windows App Paths.")
    except PermissionError:
        print(
            f"Permission denied: Unable to register '{EXE_NAME}' in App Paths. Run as Administrator.",
            file=sys.stderr,
        )
        return False
    except Exception as e:
        print(f"Error writing Registry App Paths: {e}", file=sys.stderr)
        return False

    return True


def get_wpt_bin_dir() -> str:
    """Finds the directory where wpt is installed."""
    path_dirs = os.environ.get("PATH", "").split(os.pathsep)
    for d in path_dirs:
        if os.path.exists(os.path.join(d, "wpt.exe")):
            return d

    program_files = os.environ.get("PROGRAMFILES", "C:\\Program Files")
    wpt_default = os.path.join(program_files, "wpt")
    if os.path.isdir(wpt_default):
        return wpt_default

    return ""


def create_shim(exe_path: str) -> bool:
    """Creates a .cmd shim in the wpt bin directory if possible."""
    wpt_dir = get_wpt_bin_dir()
    if not wpt_dir:
        print(
            "Warning: Could not locate wpt installation directory. Shim was not created."
        )
        return True

    shim_path = os.path.join(wpt_dir, SHIM_NAME)
    try:
        shim_content = f'@echo off\n"{exe_path}" %*\n'
        with open(shim_path, "w", encoding="utf-8") as f:
            f.write(shim_content)
        print(f"Successfully created shim '{SHIM_NAME}' at {shim_path}.")
        return True
    except Exception as e:
        print(f"Warning: Failed to create shim at {shim_path}: {e}", file=sys.stderr)
        return False


def create_start_menu_shortcut(exe_path: str, install_dir: str) -> bool:
    """Creates a Windows Start Menu desktop shortcut for all users via PowerShell."""
    if sys.platform != "win32":
        return True

    start_menu_dir = r"C:\ProgramData\Microsoft\Windows\Start Menu\Programs"
    shortcut_path = os.path.join(start_menu_dir, SHORTCUT_NAME)

    # PowerShell command to create shortcut with icon
    ps_command = (
        f"$WshShell = New-Object -ComObject WScript.Shell; "
        f'$Shortcut = $WshShell.CreateShortcut("{shortcut_path}"); '
        f'$Shortcut.TargetPath = "{exe_path}"; '
        f'$Shortcut.WorkingDirectory = "{install_dir}"; '
        f'$Shortcut.IconLocation = "{exe_path},0"; '
        f"$Shortcut.Save()"
    )

    try:
        subprocess.run(
            ["powershell", "-NoProfile", "-Command", ps_command],
            check=True,
            capture_output=True,
        )
        print("Successfully created launcher in Windows Start Menu for all users.")
    except Exception as e:
        print(f"Error creating Start Menu shortcut: {e}", file=sys.stderr)
        return False

    return True


def main():
    wpt_install_dir = os.environ.get("WPT_INSTALL_DIR")
    if not wpt_install_dir:
        print("Error: WPT_INSTALL_DIR is not set.", file=sys.stderr)
        sys.exit(1)

    program_files = os.environ.get("PROGRAMFILES", "C:\\Program Files")
    target_install_dir = os.path.join(program_files, "migasfree-play")
    target_exe_path = os.path.join(target_install_dir, EXE_NAME)

    print(f"[*] Relocating migasfree-play files to '{target_install_dir}'...")

    try:
        if os.path.exists(target_install_dir):
            shutil.rmtree(target_install_dir)

        shutil.copytree(wpt_install_dir, target_install_dir)

        for item in os.listdir(wpt_install_dir):
            item_path = os.path.join(wpt_install_dir, item)
            if os.path.isfile(item_path):
                os.remove(item_path)
            elif os.path.isdir(item_path):
                shutil.rmtree(item_path)

        print("[+] Files successfully relocated and managed cache cleared.")
    except Exception as e:
        print(f"Error relocating files: {e}", file=sys.stderr)
        sys.exit(1)

    success_reg = register_in_app_paths(target_exe_path, target_install_dir)
    create_shim(target_exe_path)
    success_shortcut = create_start_menu_shortcut(target_exe_path, target_install_dir)

    if not (success_reg and success_shortcut):
        sys.exit(1)

    print("migasfree-play installation completed successfully.")
    sys.exit(0)


if __name__ == "__main__":
    main()
