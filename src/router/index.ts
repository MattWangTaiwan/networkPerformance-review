import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import ReportView from '../views/ReportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { path: 'home' },
      children: [
        {
          path: '/home',
          name: 'Home',
          component: HomeView
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: DashboardView
        },
        {
          path: '/report',
          name: 'Report',
          component: ReportView
        }
      ]
    }
  ]
})

export default router
