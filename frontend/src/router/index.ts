import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import PosView from '@/views/PosView.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue';
import AdminProductsView from '@/views/admin/AdminProductsView.vue';
import AdminInventoryView from '@/views/admin/AdminInventoryView.vue';
import AdminEmployeesView from '@/views/admin/AdminEmployeesView.vue';
import AdminReportsView from '@/views/admin/AdminReportsView.vue';
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
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboardView
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('@/views/admin/AdminCategoriesView.vue')
        },
        {
          path: 'products',
          name: 'admin-products',
          component: AdminProductsView
        },
        {
          path: 'inventory',
          name: 'admin-inventory',
          component: AdminInventoryView
        },
        {
          path: 'employees',
          name: 'admin-employees',
          component: AdminEmployeesView
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: AdminReportsView
        }
      ]
    },
    {
      path: '/',
      redirect: () => {
        const authStore = useAuthStore();
        const positionName = authStore.user?.position?.name?.toLowerCase() || '';
        return (positionName.includes('admin') || positionName.includes('manager')) ? '/admin' : '/pos';
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/pos',
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const positionName = authStore.user?.position?.name?.toLowerCase() || '';
  const isAdmin = positionName.includes('admin') || positionName.includes('manager');

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && !isAdmin) {
    // Block non-admins from accessing admin routes
    next('/pos');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next(isAdmin ? '/admin' : '/pos');
  } else {
    next();
  }
});

export default router;
