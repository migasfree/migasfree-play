const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: { name: 'apps' } },
      {
        path: '/apps',
        name: 'apps',
        component: () => import('pages/apps/index.vue'),
      },
      {
        path: '/devices',
        name: 'devices',
        component: () => import('pages/devices/index.vue'),
      },
      {
        path: '/tags',
        name: 'tags',
        component: () => import('pages/tags/index.vue'),
      },
      {
        path: '/details',
        name: 'details',
        component: () => import('pages/details/index.vue'),
      },
      {
        path: '/preferences',
        name: 'preferences',
        component: () => import('pages/preferences/index.vue'),
      },
      {
        path: '/info',
        name: 'info',
        component: () => import('pages/info/index.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
]

export default routes
