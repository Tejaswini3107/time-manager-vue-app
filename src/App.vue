<template>
  <!-- Main Application -->
  <div class="min-h-screen flex w-full bg-background" :style="{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}">
    <!-- Sidebar -->
    <div :class="`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r bg-background/95 backdrop-blur`">
      <div class="p-4 border-b">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Clock class="h-5 w-5 text-primary-foreground" />
          </div>
          <div v-if="sidebarOpen">
            <h2 class="font-semibold">Time Manager</h2>
            <p class="text-xs text-muted-foreground">Gotham Corp</p>
          </div>
        </div>
      </div>

      <div class="p-4">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">Navigation</h3>
          <div class="space-y-1">
            <button
              v-for="item in sidebarItems"
              :key="item.value"
              @click="activeTab = item.value"
              :class="`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === item.value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`"
            >
              <component :is="item.icon" class="h-4 w-4" />
              <span v-if="sidebarOpen">{{ item.title }}</span>
            </button>
          </div>
        </div>

        <div class="mt-auto pt-4">
          <div class="p-3 rounded-lg bg-sidebar-accent/50">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <UserIcon class="h-4 w-4 text-primary-foreground" />
              </div>
              <div v-if="sidebarOpen" class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ currentUser.username }}</p>
                <p class="text-xs text-muted-foreground truncate">User</p>
              </div>
            </div>
            <div v-if="sidebarOpen" class="mt-2 space-y-2">
              <Badge variant="secondary" class="text-xs">
                ID: {{ currentUser.id }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex h-14 items-center px-4">
          <button 
            @click="sidebarOpen = !sidebarOpen"
            class="mr-4 p-2 hover:bg-accent rounded-md"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="font-semibold">
              {{ currentTitle }}
            </h1>
          </div>
          <div class="flex items-center space-x-2">
            <Badge variant="outline">
              {{ currentDate }}
            </Badge>
            <Badge variant="secondary">
              {{ currentTime }}
            </Badge>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-auto">
        <div class="container mx-auto p-6 max-w-7xl">
          
          <!-- Dashboard -->
          <div v-if="activeTab === 'dashboard'" class="space-y-6">
            <div class="flex flex-col lg:flex-row gap-6">
              <div class="flex-1">
                <User :currentUser="currentUser" :onUserUpdate="handleUserUpdate" @navigate-to-users="activeTab = 'users'" />
              </div>
              <div class="lg:w-80">
                <ClockManager :userId="currentUser.id" />
              </div>
            </div>
            
            <MetricsCards :userId="currentUser.id" />
            <DashboardCharts :userId="currentUser.id" />
          </div>

          <!-- Clock -->
          <div v-if="activeTab === 'clock'" class="max-w-2xl mx-auto">
            <ClockManager :userId="currentUser.id" />
          </div>

          <!-- Working Times -->
          <WorkingTimes v-if="activeTab === 'times'" :userId="currentUser.id" />

          <!-- Analytics -->
          <ChartManager v-if="activeTab === 'analytics'" :userId="currentUser.id" />

          <!-- Users -->
          <UsersPage v-if="activeTab === 'users'" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import User from './components/User.vue';
import ClockManager from './components/ClockManager.vue';
import WorkingTimes from './components/WorkingTimes.vue';
import ChartManager from './components/ChartManager.vue';
import DashboardCharts from './components/DashboardCharts.vue';
import MetricsCards from './components/MetricsCards.vue';
import UsersPage from './components/UsersPage.vue';
import Badge from './components/ui/badge.vue';
import { Clock, BarChart3, Calendar, Timer, User as UserIcon, Users } from 'lucide-vue-next';

export default {
  name: 'App',
  components: {
    User,
    ClockManager,
    WorkingTimes,
    ChartManager,
    DashboardCharts,
    MetricsCards,
    UsersPage,
    Badge,
    Clock,
    BarChart3,
    Calendar,
    Timer,
    UserIcon,
    Users
  },
  setup() {
    // User data - will be fetched from API
    const currentUser = ref({
      id: 1,
      name: 'Loading...',
      email: 'Loading...',
    });

    const activeTab = ref('dashboard');
    const sidebarOpen = ref(true);

    const handleUserUpdate = (user) => {
      currentUser.value = user;
    };

        const sidebarItems = [
          {
            title: "Dashboard",
            icon: BarChart3,
            value: "dashboard"
          },
          {
            title: "Time Clock",
            icon: Clock,
            value: "clock"
          },
          {
            title: "Working Times",
            icon: Calendar,
            value: "times"
          },
          {
            title: "Analytics",
            icon: BarChart3,
            value: "analytics"
          },
          {
            title: "Users",
            icon: Users,
            value: "users"
          }
        ];

    const currentDate = computed(() => new Date().toLocaleDateString());
    const currentTime = computed(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const currentTitle = computed(() => sidebarItems.find(item => item.value === activeTab.value)?.title || 'Dashboard');


    return {
      // User data
      currentUser,
      
      // UI State
      activeTab,
      sidebarOpen,
      
      // Handlers
      handleUserUpdate,
      
      // Data
      sidebarItems,
      currentDate,
      currentTime,
      currentTitle
    };
  }
};
</script>
