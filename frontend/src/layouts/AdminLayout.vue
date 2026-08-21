<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  Menu,
  Bell,
  Search,
  LayoutGrid,
  ChevronDown,
  Moon,
  Sun,
  BarChart3,
  UserPen
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const appStore = useAppStore();
const isSidebarOpen = ref(true);
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.user-profile-container')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Categories', path: '/admin/categories', icon: LayoutGrid },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Inventory', path: '/admin/inventory', icon: ShoppingCart },
  { name: 'Employees', path: '/admin/employees', icon: Users },
  { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
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
          :title="!isSidebarOpen ? $t(`menu.${item.name.toLowerCase()}`) : ''"
        >
          <component :is="item.icon" class="nav-icon" :size="20" />
          <span class="nav-label" v-if="isSidebarOpen">{{ $t(`menu.${item.name.toLowerCase()}`) }}</span>
        </router-link>
      </nav>

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
            <input type="text" :placeholder="$t('common.search')" class="search-input" />
          </div>
        </div>

        <div class="topbar-right">
          <button class="icon-btn">
            <Bell :size="20" />
            <span class="notification-badge"></span>
          </button>
          
          <div class="user-profile-container">
            <div class="user-profile" @click="toggleDropdown">
              <div class="avatar">
                {{ authStore.user?.email?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div class="user-info">
                <p class="user-name">{{ authStore.user?.email || 'User' }}</p>
                <p class="user-role">{{ $t('common.admin') }}</p>
              </div>
              <ChevronDown :size="16" class="dropdown-icon" :class="{ 'dropdown-icon--open': isDropdownOpen }" />
            </div>

            <!-- Dropdown Menu -->
            <transition name="dropdown-fade">
              <div class="profile-dropdown glass-panel" v-if="isDropdownOpen">
                <div class="dropdown-header">
                  <p class="dropdown-name">{{ authStore.user?.email || 'User' }}</p>
                  <p class="dropdown-email">{{ authStore.user?.employee?.employee_number || 'Administrator' }}</p>
                </div>
                
                <div class="dropdown-divider"></div>

                <div class="dropdown-item" style="cursor: pointer" @click="isDropdownOpen = false; router.push('/admin/profile')">
                  <span class="dropdown-item-label">{{ $t('settings.edit_profile') }}</span>
                  <UserPen :size="16" class="dropdown-icon" />
                </div>
                
                <div class="dropdown-item">
                  <span class="dropdown-item-label">{{ $t('settings.dark_mode') }}</span>
                  <button 
                    class="theme-toggle" 
                    :class="{ 'theme-toggle--active': appStore.theme === 'dark' }"
                    @click.stop="appStore.toggleTheme"
                  >
                    <div class="toggle-track">
                      <div class="toggle-thumb">
                        <Moon :size="12" v-if="appStore.theme === 'dark'" />
                        <Sun :size="12" v-else />
                      </div>
                    </div>
                  </button>
                </div>

                <div class="dropdown-item">
                  <span class="dropdown-item-label">{{ $t('settings.language') }}</span>
                  <div class="lang-selector">
                    <button 
                      class="lang-btn" 
                      :class="{ active: appStore.locale === 'en' }"
                      @click.stop="appStore.setLocale('en')"
                    >
                      EN
                    </button>
                    <button 
                      class="lang-btn" 
                      :class="{ active: appStore.locale === 'id' }"
                      @click.stop="appStore.setLocale('id')"
                    >
                      ID
                    </button>
                  </div>
                </div>

                <div class="dropdown-divider"></div>
                
                <button class="dropdown-item dropdown-logout" @click="handleLogout">
                  <LogOut :size="16" />
                  <span>{{ $t('menu.logout') }}</span>
                </button>
              </div>
            </transition>
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
  background-color: var(--bg-dark);
  overflow: hidden;
  font-family: var(--font-sans);
}

/* SIDEBAR */
.sidebar {
  width: 260px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
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
  border-bottom: 1px solid var(--border);
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
  color: var(--text-main);
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
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background-color: var(--bg-card-hover);
  color: var(--text-main);
}

.nav-item--active {
  background-color: var(--primary-light);
  color: var(--primary);
}

.nav-item--active .nav-icon {
  color: var(--primary);
}

.nav-icon {
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid var(--border);
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
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border);
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
  color: var(--text-muted);
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
  background-color: var(--bg-card-hover);
  color: var(--text-main);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--bg-input);
  border-radius: 20px;
  padding: 8px 16px;
  width: 300px;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  background-color: var(--bg-card);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.search-icon {
  color: var(--text-dim);
  margin-right: 8px;
}

.search-input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 0.875rem;
  color: var(--text-main);
}

.search-input::placeholder {
  color: var(--text-dim);
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

.user-profile-container {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 20px;
  border-left: 1px solid var(--border);
  cursor: pointer;
  user-select: none;
}

.user-profile:hover .user-name {
  color: var(--primary);
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
  color: var(--text-main);
  font-size: 0.875rem;
  transition: color 0.2s;
}

.user-role {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.dropdown-icon {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.dropdown-icon--open {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  width: 240px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 8px 0;
  z-index: 50;
  transform-origin: top right;
}

.dropdown-header {
  padding: 12px 16px;
}

.dropdown-name {
  font-weight: 600;
  color: var(--text-main);
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.dropdown-email {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border);
  margin: 4px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  color: var(--text-main);
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.dropdown-item-label {
  font-weight: 500;
}

.dropdown-logout {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--danger);
  justify-content: flex-start;
  gap: 12px;
  font-weight: 500;
}

.dropdown-logout:hover {
  background-color: var(--danger-light);
}

/* Theme Toggle Button */
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.toggle-track {
  width: 44px;
  height: 24px;
  background-color: var(--border-light);
  border-radius: 24px;
  position: relative;
  transition: background-color 0.3s;
}

.theme-toggle--active .toggle-track {
  background-color: var(--primary);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.theme-toggle--active .toggle-thumb {
  transform: translateX(20px);
  color: var(--bg-dark);
}

/* Language Selector */
.lang-selector {
  display: flex;
  background-color: var(--bg-input);
  padding: 2px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.lang-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn.active {
  background-color: var(--bg-card);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

/* Dropdown Animation */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* PAGE CONTENT */
.page-container {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background-color: var(--bg-dark);
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
