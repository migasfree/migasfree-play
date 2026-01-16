import json
from migasfree_client.client import MigasFreeClient

mfc = MigasFreeClient()
print(json.dumps(mfc.pms.available_packages()))
