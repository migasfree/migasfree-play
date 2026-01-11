import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppsStore } from 'src/stores/apps'
import { useFiltersStore } from 'src/stores/filters'
import { usePackagesStore } from 'src/stores/packages'
import { useComputerStore } from 'src/stores/computer'

import { api } from 'boot/axios'

// Define shared state objects to ensure singleton behavior in mocks
// We use a setup helper or just define them here because we can't easily hoist refs into vi.mock
// Strategy: use vi.mock with a factory that returns a consistent object.
// But we need to access 'vue' inside the factory.

vi.mock('boot/axios', () => ({
  api: { get: vi.fn() },
}))

vi.mock('config/app.conf', () => ({
  tokenApi: { apps: '/apps/' },
}))

vi.mock('src/stores/computer', async () => {
  const { ref } = await import('vue')
  const state = {
    cid: ref('computer-123'),
    project: ref('migasfree'),
  }
  return { useComputerStore: () => state }
})

vi.mock('src/stores/program', async () => {
  const { ref } = await import('vue')
  const state = {
    initialUrl: ref({ token: 'http://api' }),
    token: ref('valid-token'),
  }
  return { useProgramStore: () => state }
})

vi.mock('src/stores/filters', async () => {
  const { ref } = await import('vue')
  const state = {
    searchApp: ref(''),
    selectedCategory: ref(null),
    onlyInstalledApps: ref(false),
  }
  return { useFiltersStore: () => state }
})

vi.mock('src/stores/packages', async () => {
  const { ref } = await import('vue')
  const state = {
    installed: ref([]),
  }
  return { usePackagesStore: () => state }
})

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({ notifyError: vi.fn() }),
}))

const mockAppsData = [
  {
    id: 1,
    name: 'Firefox',
    description: 'Web browser',
    category: { id: 1, name: 'Internet' },
    packages_by_project: [
      { project: { name: 'migasfree' }, packages_to_install: ['firefox'] },
      { project: { name: 'other' }, packages_to_install: ['firefox-nightly'] },
    ],
  },
  {
    id: 2,
    name: 'VLC',
    description: 'Media player',
    category: { id: 2, name: 'Multimedia' },
    packages_by_project: [
      { project: { name: 'migasfree' }, packages_to_install: ['vlc'] },
    ],
  },
  {
    id: 3,
    name: 'GIMP',
    description: 'Image editor',
    category: { id: 3, name: 'Graphics' },
    packages_by_project: [
      { project: { name: 'migasfree' }, packages_to_install: ['gimp'] },
    ],
  },
]

describe('Apps Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    api.get.mockResolvedValue({ data: { results: mockAppsData } })

    // Reset mock stores state
    const filters = useFiltersStore()
    filters.searchApp.value = ''
    filters.selectedCategory.value = null
    filters.onlyInstalledApps.value = false

    const packages = usePackagesStore()
    packages.installed.value = []

    const computer = useComputerStore()
    computer.cid.value = 'computer-123'
    computer.project.value = 'migasfree'
  })

  it('loadApps() fetches and processes apps correctly', async () => {
    const store = useAppsStore()
    await store.loadApps()

    expect(store.filteredApps.length).toBe(3)
    expect(store.filteredApps[0].name).toBe('Firefox')
    expect(store.filteredApps[0].packages_to_install).toEqual(['firefox'])
  })

  it('filters apps by search text', async () => {
    const store = useAppsStore()
    const filtersStore = useFiltersStore()
    await store.loadApps()

    filtersStore.searchApp.value = 'web'
    store.filterApps()
    expect(store.filteredApps.length).toBe(1)
    expect(store.filteredApps[0].name).toBe('Firefox')

    filtersStore.searchApp.value = 'vlc'
    store.filterApps()
    expect(store.filteredApps[0].name).toBe('VLC')
  })

  it('filters apps by category', async () => {
    const store = useAppsStore()
    const filtersStore = useFiltersStore()
    await store.loadApps()

    filtersStore.selectedCategory.value = { id: 2, name: 'Multimedia' }
    store.filterApps()
    expect(store.filteredApps.length).toBe(1)
    expect(store.filteredApps[0].name).toBe('VLC')
  })

  it('filters by installed apps', async () => {
    const store = useAppsStore()
    const filtersStore = useFiltersStore()
    const packagesStore = usePackagesStore()
    await store.loadApps()

    filtersStore.onlyInstalledApps.value = true
    packagesStore.installed.value = []
    store.filterApps()
    expect(store.filteredApps.length).toBe(0)

    packagesStore.installed.value = ['vlc']
    store.filterApps()

    // Debug: Why it might fail?
    // apps value needs to be refreshed? No, filterApps uses apps.value which is set by loadApps.
    // apps.value contains vlc. vlc has packages_to_install: ['vlc'].
    // installedSet has 'vlc'.
    // Should match.

    expect(store.filteredApps.length).toBe(1)
    expect(store.filteredApps[0].name).toBe('VLC')
  })

  it('computes all packages from apps', async () => {
    const store = useAppsStore()
    await store.loadApps()
    const pkgs = store.getAppsPackages
    expect(pkgs).toContain('firefox')
    expect(pkgs).toContain('vlc')
    expect(pkgs).toContain('gimp')
  })
})
