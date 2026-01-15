import json
from migasfree_client.sync import MigasFreeSync

mfs = MigasFreeSync()
mfs.pms_selection()
print(json.dumps(mfs.pms.available_packages()))
