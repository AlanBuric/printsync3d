import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'home',
      component: HomeView
    },
    {
      path: '/printer/:id',
      name: 'printer',
      component: () => import('./views/PrinterView.vue')
    },
    {
      path: '/start-printing/:id',
      name: 'start-printing',
      component: () => import('./views/PrintingView.vue')
    }
  ]
});

export default router;
