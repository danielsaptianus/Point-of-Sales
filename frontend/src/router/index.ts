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
          path: 'employees/new',
          name: 'admin-employee-new',
          component: () => import('@/views/admin/AdminEmployeeFormView.vue')
        },
        {
          path: 'employees/edit/:id',
          name: 'admin-employee-edit',
          component: () => import('@/views/admin/AdminEmployeeFormView.vue')
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: AdminReportsView
        },
        {
          path: 'shifts',
          name: 'admin-shifts',
          component: () => import('@/views/admin/AdminShiftsView.vue')
        },
        {
          path: 'vouchers',
          name: 'admin-vouchers',
          component: () => import('@/views/admin/AdminVouchersView.vue')
        },
        {
          path: 'profile',
          name: 'admin-profile',
          component: () => import('@/views/admin/AdminProfileView.vue')
        }
      ]
    },
    {
      path: '/',
      redirect: () => {
        const authStore = useAuthStore();
        const positionName = authStore.user?.position?.name?.toLowerCase() || '';
        if (positionName.includes('admin') || positionName.includes('manager')) return '/admin';
        if (positionName.includes('gudang')) return '/admin/inventory';
        return '/pos';
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
  const isGudang = positionName.includes('gudang');
  const isKasir = positionName.includes('kasir');

  const hasAdminAccess = isAdmin || isGudang;

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && !hasAdminAccess) {
    // Block non-admins/gudang from accessing admin routes
    next('/pos');
  } else if (to.path.startsWith('/admin') && isGudang) {
    // Gudang only allowed on products and inventory
    if (to.path === '/admin/products' || to.path === '/admin/inventory') {
      next();
    } else {
      next('/admin/inventory');
    }
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    if (isAdmin) next('/admin');
    else if (isGudang) next('/admin/inventory');
    else next('/pos');
  } else {
    next();
  }
});

export default router;
