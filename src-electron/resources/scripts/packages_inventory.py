import json
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
print(json.dumps(mfc.pms.query_all()))
