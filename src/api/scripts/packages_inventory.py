import json
import sys
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()

is_legacy = '--legacy' in sys.argv

if not is_legacy:
    mfc.pms_selection()

print(json.dumps(mfc.pms.query_all()))
