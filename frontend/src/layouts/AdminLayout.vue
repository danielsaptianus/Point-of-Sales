<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Inventory', path: '/admin/inventory', icon: ShoppingCart },
  { name: 'Employees', path: '/admin/employees', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside :class="['sidebar', { 'sidebar--closed': !isSidebarOpen }]">
      <div class="sidebar-header">
        <div class="logo-container" v-if="isSidebarOpen">
          <div class="logo-circle">
            <span class="logo-text">POS</span>
          </div>
          <h2 class="brand-name">Nexus POS</h2>
        </div>
        <div class="logo-circle logo-mini" v-else>
          <span class="logo-text">P</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="nav-item--active"
          :title="!isSidebarOpen ? item.name : ''"
        >
          <component :is="item.icon" class="nav-icon" :size="20" />
          <span class="nav-label" v-if="isSidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="handleLogout" :title="!isSidebarOpen ? 'Logout' : ''">
          <LogOut class="nav-icon" :size="20" />
          <span class="nav-label" v-if="isSidebarOpen">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-btn toggle-btn" @click="toggleSidebar">
            <Menu :size="24" />
          </button>
          
          <div class="search-bar">
            <Search class="search-icon" :size="18" />
            <input type="text" placeholder="Search anything..." class="search-input" />
          </div>
        </div>

        <div class="topbar-right">
          <button class="icon-btn">
            <Bell :size="20" />
            <span class="notification-badge"></span>
          </button>
          
          <div class="user-profile">
            <div class="avatar">
              {{ authStore.user?.email?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="user-info">
              <p class="user-name">{{ authStore.user?.email || 'User' }}</p>
              <p class="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f8fafc;
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* SIDEBAR */
.sidebar {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.sidebar--closed {
  width: 72px;
}

.sidebar-header {
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #e2e8f0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.logo-circle {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-mini {
  margin: 0 auto;
}

.logo-text {
  color: white;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.nav-item--active {
  background-color: #eff6ff;
  color: #2563eb;
}

.nav-item--active .nav-icon {
  color: #2563eb;
}

.nav-icon {
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid #e2e8f0;
}

.logout-btn {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  justify-content: flex-start;
  color: #ef4444;
}

.logout-btn:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* TOPBAR */
.topbar {
  height: 72px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.icon-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
}

.icon-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f1f5f9;
  border-radius: 20px;
  padding: 8px 16px;
  width: 300px;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  background-color: #ffffff;
  box-shadow: 0 0 0 2px #bfdbfe;
}

.search-icon {
  color: #94a3b8;
  margin-right: 8px;
}

.search-input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 0.875rem;
  color: #334155;
}

.search-input::placeholder {
  color: #94a3b8;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 20px;
  border-left: 1px solid #e2e8f0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
}

.user-role {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

/* PAGE CONTENT */
.page-container {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background-color: #f8fafc;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    height: 100%;
    transform: translateX(-100%);
  }
  
  .sidebar:not(.sidebar--closed) {
    transform: translateX(0);
    width: 260px;
    box-shadow: 4px 0 24px rgba(0,0,0,0.1);
  }

  .search-bar {
    display: none;
  }
}
</style>
