import AppLayout from '@/layout/AppLayout.vue';
import Dashboard from '@/views/Dashboard.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '/',
          name: 'dashboard',
          component: Dashboard,
        },
      ]
    },
  ]
});

export default router;
