import { ipcMain } from 'electron'
import { pythonExecute, cliExecute, debug } from '../python-utils.js'

const buildCodeV4 = () => {
  return `
import json
from migasfree_client.tags import MigasFreeTags

mft = MigasFreeTags()
response = mft._get_tags()
print(json.dumps({
  "assigned": response["selected"],
  "available": response["available"]
}, ensure_ascii=False))`
}

export default function registerTagsHandlers() {
  ipcMain.handle('tags:get', async (_, { version }) => {
    if (debug) console.log(`[ipc] Getting tags (${version})...`)

    try {
      if (version && version.startsWith('4.')) {
        const results = await pythonExecute(buildCodeV4())
        return JSON.parse(results)
      }

      const results = await cliExecute(['--quiet', 'tags', '--get'])
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return { assigned: [], available: {} }
    }
  })
}
