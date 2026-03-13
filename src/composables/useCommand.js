import { storeToRefs } from 'pinia'
import { useServerStore } from 'src/stores/server'

/**
 * Composable for building migasfree commands and checking legacy versions
 * @returns {Object} { isLegacyClient, isLegacyServer, buildMigasfreeCommand }
 */
export function useCommand() {
  const serverStore = useServerStore()
  const { isLegacyClient, isLegacyServer } = storeToRefs(serverStore)

  /**
   * Builds the arguments for a migasfree command based on the version
   * @param {String} action - The action to perform (install, remove, sync)
   * @param {Array} packages - The list of packages (if applicable)
   * @returns {Object} { command, args }
   */
  const buildMigasfreeCommand = (action, packages = []) => {
    const cmd = {
      command: 'migasfree',
      args: [],
    }

    if (isLegacyClient.value) {
      const legacyArgs = {
        sync: ['--update'],
        install: [
          '--install',
          `--package=${packages[0]}`,
          ...packages.slice(1),
        ],
        remove: ['--remove', `--package=${packages[0]}`, ...packages.slice(1)],
        'tags-communicate': [
          '--communicate',
          packages.length ? packages.join(' ') : '""',
        ],
        'tags-set': ['--set', packages.length ? packages.join(' ') : '""'],
      }

      if (action.startsWith('tags-')) {
        cmd.command = 'migasfree-tags'
        cmd.args = legacyArgs[action] || []
      } else {
        cmd.args = legacyArgs[action] || []
      }
    } else {
      const modernActions = {
        sync: 'sync',
        install: 'install',
        remove: 'purge',
        'tags-communicate': ['tags', '--communicate'],
        'tags-set': ['tags', '--set'],
      }

      const mapped = modernActions[action]
      if (Array.isArray(mapped)) {
        cmd.args = [...mapped, ...packages]
      } else {
        cmd.args = [mapped, ...packages]
      }
    }

    return cmd
  }

  return {
    isLegacyClient,
    isLegacyServer,
    buildMigasfreeCommand,
  }
}
