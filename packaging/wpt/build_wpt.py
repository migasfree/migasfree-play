import os
import shutil
import subprocess
import sys


def build_pms_package():
    # 1. Paths Setup
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..', '..'))

    wpt_source_dir = os.path.join(script_dir, 'migasfree-play-source')
    data_dir = os.path.join(wpt_source_dir, 'data')

    print(f'[*] Project root identified: {project_root}')

    # 2. Compile via Quasar CLI
    print('[*] Compiling migasfree-play via Quasar CLI (unpacked dir target)...')
    try:
        # Set WPT_BUILD=1 environment variable so quasar.config.js targets ['dir']
        env = os.environ.copy()
        env['WPT_BUILD'] = '1'

        # On Windows, shell=True is required to resolve yarnpkg command (.cmd wrapper)
        use_shell = sys.platform == 'win32'
        subprocess.run(['yarnpkg', 'build'], cwd=project_root, env=env, shell=use_shell, check=True)
    except subprocess.CalledProcessError as e:
        print(f'[!] Quasar build failed: {e}', file=sys.stderr)
        sys.exit(1)

    # 3. Locate compiled directory
    # Electron builder outputs compiled dir inside dist/electron/Packaged/ or dist/electron/
    search_dirs = [
        os.path.join(project_root, 'dist', 'electron', 'Packaged'),
        os.path.join(project_root, 'dist', 'electron'),
    ]

    compiled_folder = None
    for s_dir in search_dirs:
        if not os.path.exists(s_dir):
            continue
        for entry in os.listdir(s_dir):
            entry_path = os.path.join(s_dir, entry)
            if os.path.isdir(entry_path) and ('win32' in entry or 'win-unpacked' in entry):
                compiled_folder = entry_path
                break
        if compiled_folder:
            break

    if not compiled_folder:
        print('[!] Failed to locate compiled electron directory under dist/electron.', file=sys.stderr)
        sys.exit(1)

    print(f'[*] Found compiled electron directory: {compiled_folder}')

    # 4. Structure the WPT package folder
    if os.path.exists(wpt_source_dir):
        shutil.rmtree(wpt_source_dir)

    os.makedirs(wpt_source_dir)

    # Copy pms files (metadata, install, remove)
    shutil.copytree(os.path.join(script_dir, 'pms'), os.path.join(wpt_source_dir, 'pms'))

    # Copy Electron output directory to WPT data/
    shutil.copytree(compiled_folder, data_dir)
    print('[*] Structured WPT package directory.')

    # 5. Invoke WPT Build
    print('[*] Invoking WPT to build the final package...')
    try:
        # Assumes 'wpt' CLI is installed and available in the environment
        subprocess.run(['wpt', 'build', wpt_source_dir], check=True)
        print('[+] WPT package built successfully.')
    except Exception as e:
        print(f'[!] Error building WPT package: {e}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    build_pms_package()
