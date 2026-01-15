import json
import sys
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()

# Legacy check: if not legacy (default), select PMS.
# Logic derived from original code: v4 used mfc directly, v5 calls pms_selection
# We can pass a flag --legacy
is_legacy = '--legacy' in sys.argv

if not is_legacy:
    mfc.pms_selection()

installed = []
packages = []

# Find JSON argument (list of packages)
for arg in sys.argv[1:]:
    # Simple heuristic: starts with [ and ends with ]
    if arg.strip().startswith('[') and arg.strip().endswith(']'):
        try:
            packages = json.loads(arg)
            break
        except ValueError:
            continue

# Fallback/Backward compatibility
if not packages:
    if len(sys.argv) > 1 and not sys.argv[1].startswith('--'):
        try:
            packages = json.loads(sys.argv[1])
        except ValueError:
            pass
    elif len(sys.argv) > 2:
        try:
            packages = json.loads(sys.argv[2])
        except ValueError:
            pass

installed = [pkg for pkg in packages if mfc.pms.is_installed(pkg) and pkg not in installed]

print(json.dumps(installed))
