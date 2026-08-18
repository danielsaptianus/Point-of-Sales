import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import PosView from '@/views/PosView.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue';
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
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboardView
        }
        // Future admin routes will go here (products, users, etc.)
      ]
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
