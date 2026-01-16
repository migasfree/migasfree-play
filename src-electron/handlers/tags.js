import { ipcMain } from 'electron'
import { pythonExecute, debug } from '../python-utils.js'

const buildCode = (version) => {
  return version.startsWith('4.')
    ? `
import json
from migasfree_client.tags import MigasFreeTags

mft = MigasFreeTags()
response = mft._get_tags()
print(json.dumps({
  "assigned": response["selected"],
  "available": response["available"]
}, ensure_ascii=False))`
    : `
import json
from migasfree_client.tags import MigasFreeTags

mft = MigasFreeTags()
print(json.dumps({
  "assigned": mft.get_assigned_tags(),
  "available": mft.get_available_tags()
}, ensure_ascii=False))`
}

export default function registerTagsHandlers() {
  ipcMain.handle('tags:get', async (_, { version }) => {
    if (debug) console.log(`[ipc] Getting tags (${version})...`)

    const code = buildCode(version)
    try {
      const results = await pythonExecute(code)
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return { assigned: [], available: {} }
    }
  })
}
