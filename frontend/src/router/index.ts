import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import PosView from '@/views/PosView.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/pos',
      name: 'pos',
      component: PosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      redirect: '/pos',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/pos',
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/pos');
  } else {
    next();
  }
});

export default router;
