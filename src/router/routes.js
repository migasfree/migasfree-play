const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: { name: 'apps' } },
      {
        path: '/apps',
        name: 'apps',
        component: () => import('pages/apps/index')
      },
      {
        path: '/devices',
        name: 'devices',
        component: () => import('pages/devices/index')
      },
      {
        path: '/tags',
        name: 'tags',
        component: () => import('pages/tags/index')
      },
      {
        path: '/details',
        name: 'details',
        component: () => import('pages/details/index')
      },
      {
        path: '/preferences',
        name: 'preferences',
        component: () => import('pages/preferences/index')
      },
      {
        path: '/info',
        name: 'info',
        component: () => import('pages/info/index')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
