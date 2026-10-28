import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { title: 'Dzień dyspozytora' },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersView.vue'),
      meta: { title: 'Zlecenia' },
    },
    {
      path: '/orders/:id',
      name: 'order-details',
      component: () => import('@/views/OrderDetailsView.vue'),
      props: true,
      meta: { title: 'Szczegóły zlecenia' },
    },
    {
      path: '/dispatch',
      name: 'dispatch',
      component: () => import('@/views/DispatchView.vue'),
      meta: { title: 'Planowanie' },
    },
    {
      path: '/fleet',
      name: 'fleet',
      component: () => import('@/views/FleetView.vue'),
      meta: { title: 'Kierowcy i auta' },
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('@/views/MapView.vue'),
      meta: { title: 'Mapa' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Nie znaleziono' },
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · FleetDesk` : 'FleetDesk'
})

export default router

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}
