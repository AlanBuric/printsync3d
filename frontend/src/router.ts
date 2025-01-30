import { createRouter, createWebHistory, RouterView } from 'vue-router';
import HomeView from './views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:locale?',
      component: RouterView,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'printer/:id',
          name: 'printer',
          component: () => import('./views/PrinterView.vue'),
        },
        {
          path: 'models',
          name: 'models',
          component: () => import('./views/ModelsView.vue'),
        },
      ],
    },
  ],
});

export default router;
