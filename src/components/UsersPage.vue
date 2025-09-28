<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Users Management</h1>
        <p class="text-muted-foreground mt-2">Manage all users and their details</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button @click="showAddUserModal = true" class="flex items-center space-x-2">
          <UserPlus class="h-4 w-4" />
          <span>Add User</span>
        </Button>
        <Button @click="refreshUsers" :disabled="loading" class="flex items-center space-x-2">
          <RefreshCw :class="['h-4 w-4', loading ? 'animate-spin' : '']" />
          <span>Refresh</span>
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-2">
            <Users class="h-8 w-8 text-blue-500" />
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Users</p>
              <p class="text-2xl font-bold">{{ users.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-2">
            <Clock class="h-8 w-8 text-green-500" />
            <div>
              <p class="text-sm font-medium text-muted-foreground">Active Today</p>
              <p class="text-2xl font-bold">{{ activeUsersToday }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-2">
            <Calendar class="h-8 w-8 text-orange-500" />
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Hours</p>
              <p class="text-2xl font-bold">{{ totalHoursWorked }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-2">
            <TrendingUp class="h-8 w-8 text-purple-500" />
            <div>
              <p class="text-sm font-medium text-muted-foreground">Avg Hours/Day</p>
              <p class="text-2xl font-bold">{{ averageHoursPerDay }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Users Table -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <Users class="h-5 w-5" />
          <span>All Users</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="flex items-center space-x-2">
            <RefreshCw class="h-4 w-4 animate-spin" />
            <span>Loading users...</span>
          </div>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p class="text-red-600 mb-2">Failed to load users</p>
          <p class="text-sm text-muted-foreground">{{ error }}</p>
        </div>

        <div v-else-if="users.length === 0" class="text-center py-8">
          <Users class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p class="text-muted-foreground">No users found</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4 font-medium">User</th>
                <th class="text-left py-3 px-4 font-medium">Email</th>
                <th class="text-left py-3 px-4 font-medium">Status</th>
                <th class="text-left py-3 px-4 font-medium">Today's Hours</th>
                <th class="text-left py-3 px-4 font-medium">Total Hours</th>
                <th class="text-left py-3 px-4 font-medium">Last Activity</th>
                <th class="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usersWithDetails" :key="user.id" class="border-b hover:bg-muted/50">
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User class="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p class="font-medium">{{ user.name || 'User ' + user.id }}</p>
                      <p class="text-sm text-muted-foreground">ID: {{ user.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm">{{ user.email || 'No email' }}</p>
                </td>
                <td class="py-3 px-4">
                  <Badge :variant="user.isClockedIn ? 'default' : 'secondary'">
                    {{ user.isClockedIn ? 'Active' : 'Inactive' }}
                  </Badge>
                </td>
                <td class="py-3 px-4">
                  <p class="font-mono text-sm">{{ user.todayHours }}h</p>
                </td>
                <td class="py-3 px-4">
                  <p class="font-mono text-sm">{{ user.totalHours }}h</p>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm text-muted-foreground">{{ user.lastActivity }}</p>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-2">
                    <Button variant="outline" size="sm" @click="viewUserDetails(user)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" @click="editUser(user)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" @click="deleteUser(user)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- User Details Modal -->
    <div v-if="selectedUser" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-2xl mx-4">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center space-x-2">
              <User class="h-5 w-5" />
              <span>User Details</span>
            </CardTitle>
            <Button variant="ghost" size="sm" @click="selectedUser = null">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Name</label>
              <p class="text-lg">{{ selectedUser.name || 'User ' + selectedUser.id }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Email</label>
              <p class="text-lg">{{ selectedUser.email || 'No email' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">User ID</label>
              <p class="text-lg">{{ selectedUser.id }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Status</label>
              <Badge :variant="selectedUser.isClockedIn ? 'default' : 'secondary'">
                {{ selectedUser.isClockedIn ? 'Active' : 'Inactive' }}
              </Badge>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Today's Hours</label>
              <p class="text-lg font-mono">{{ selectedUser.todayHours }}h</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Total Hours</label>
              <p class="text-lg font-mono">{{ selectedUser.totalHours }}h</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Last Activity</label>
              <p class="text-lg">{{ selectedUser.lastActivity }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Created</label>
              <p class="text-lg">{{ selectedUser.createdAt }}</p>
            </div>
          </div>
          
          <!-- Recent Activity -->
          <div>
            <h3 class="text-lg font-semibold mb-2">Recent Activity</h3>
            <div class="space-y-2">
              <div v-for="activity in selectedUser.recentActivity" :key="activity.id" 
                   class="flex items-center justify-between p-2 bg-muted rounded">
                <div class="flex items-center space-x-2">
                  <Clock class="h-4 w-4" />
                  <span class="text-sm">{{ activity.type }}</span>
                </div>
                <span class="text-sm text-muted-foreground">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-md mx-4">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center space-x-2">
              <UserPlus class="h-5 w-5" />
              <span>Add New User</span>
            </CardTitle>
            <Button variant="ghost" size="sm" @click="closeAddUserModal">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Name</label>
            <input
              v-model="newUser.name"
              type="text"
              placeholder="Enter user name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Email</label>
            <input
              v-model="newUser.email"
              type="email"
              placeholder="Enter user email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div v-if="addUserError" class="bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex items-center">
              <AlertCircle class="h-5 w-5 text-red-500 mr-2" />
              <p class="text-red-700 text-sm">{{ addUserError }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2 pt-4">
            <Button @click="saveNewUser" :disabled="!newUser.name || !newUser.email || addUserLoading" class="flex-1">
              <Save v-if="!addUserLoading" class="h-4 w-4 mr-2" />
              <RefreshCw v-else class="h-4 w-4 mr-2 animate-spin" />
              {{ addUserLoading ? 'Creating...' : 'Create User' }}
            </Button>
            <Button variant="outline" @click="closeAddUserModal">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useUsers } from '../composables/useUsers.js';
import { useClocks } from '../composables/useClocks.js';
import { useWorkingTime } from '../composables/useWorkingTime.js';
import Button from './ui/button.vue';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import Badge from './ui/badge.vue';
import { 
  Users, 
  User, 
  Clock, 
  Calendar, 
  TrendingUp, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  Edit, 
  X,
  UserPlus,
  Save,
  Trash2
} from 'lucide-vue-next';

export default {
  name: 'UsersPage',
  components: {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Users,
    User,
    Clock,
    Calendar,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    Eye,
    Edit,
    X,
    UserPlus,
    Save,
    Trash2
  },
  setup() {
    const { users, fetchUsers, loading, error, createUser, deleteUser: deleteUserAPI } = useUsers();
    const { clocks, fetchClocks } = useClocks();
    const { workingTimes, fetchWorkingTimes } = useWorkingTime();
    
    const selectedUser = ref(null);
    const showAddUserModal = ref(false);
    const addUserLoading = ref(false);
    const addUserError = ref('');
    const newUser = ref({
      name: '',
      email: ''
    });

    // Computed properties for user details
    const usersWithDetails = computed(() => {
      return users.value.map(user => {
        const userClocks = clocks.value.filter(clock => clock.user_id == user.id);
        const userWorkingTimes = workingTimes.value.filter(wt => wt.user_id == user.id);
        
        // Calculate today's hours
        const today = new Date().toDateString();
        const todayClocks = userClocks.filter(clock => {
          const clockDate = new Date(clock.time).toDateString();
          return clockDate === today;
        });
        
        // Calculate total hours from working times
        const totalHours = userWorkingTimes.reduce((total, wt) => {
          const start = new Date(wt.start);
          const end = new Date(wt.end);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            return total + (end - start) / (1000 * 60 * 60);
          }
          return total;
        }, 0);
        
        // Get last activity
        const lastClock = userClocks[userClocks.length - 1];
        const lastActivity = lastClock ? new Date(lastClock.time).toLocaleString() : 'No activity';
        
        // Get recent activity (last 5 clock entries)
        const recentActivity = userClocks.slice(-5).map(clock => ({
          id: clock.id,
          type: clock.status ? 'Clocked In' : 'Clocked Out',
          time: new Date(clock.time).toLocaleString()
        })).reverse();
        
        return {
          ...user,
          isClockedIn: lastClock ? lastClock.status : false,
          todayHours: Math.round(todayClocks.length * 0.5 * 100) / 100, // Rough estimate
          totalHours: Math.round(totalHours * 100) / 100,
          lastActivity,
          recentActivity,
          createdAt: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
        };
      });
    });

    const activeUsersToday = computed(() => {
      return usersWithDetails.value.filter(user => user.isClockedIn).length;
    });

    const totalHoursWorked = computed(() => {
      return usersWithDetails.value.reduce((total, user) => total + user.totalHours, 0);
    });

    const averageHoursPerDay = computed(() => {
      const total = totalHoursWorked.value;
      const days = usersWithDetails.value.length > 0 ? 7 : 1; // Assume 7 days
      return Math.round((total / days) * 100) / 100;
    });

    const refreshUsers = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchClocks(),
          fetchWorkingTimes()
        ]);
      } catch (err) {
        console.error('Failed to refresh users:', err);
      }
    };

    const viewUserDetails = (user) => {
      selectedUser.value = user;
    };

    const editUser = (user) => {
      // TODO: Implement edit user functionality
      console.log('Edit user:', user);
    };

    const deleteUser = async (user) => {
      if (confirm(`Are you sure you want to delete user "${user.name || 'User ' + user.id}"? This action cannot be undone.`)) {
        try {
          console.log('Deleting user:', user);
          await deleteUserAPI(user.id);
          
          // Refresh users list
          await refreshUsers();
          
          console.log('User deleted successfully');
        } catch (err) {
          console.error('Failed to delete user:', err);
          alert(`Failed to delete user: ${err.message || 'Unknown error'}`);
        }
      }
    };

    const saveNewUser = async () => {
      if (!newUser.value.name || !newUser.value.email) {
        addUserError.value = 'Please fill in all required fields';
        return;
      }

      addUserLoading.value = true;
      addUserError.value = '';

      try {
        console.log('Creating new user:', newUser.value);
        await createUser(newUser.value);
        
        // Reset form
        newUser.value = { name: '', email: '' };
        showAddUserModal.value = false;
        
        // Refresh users list
        await refreshUsers();
        
        console.log('User created successfully');
      } catch (err) {
        console.error('Failed to create user:', err);
        addUserError.value = err.message || 'Failed to create user. Please try again.';
      } finally {
        addUserLoading.value = false;
      }
    };

    const closeAddUserModal = () => {
      showAddUserModal.value = false;
      newUser.value = { name: '', email: '' };
      addUserError.value = '';
    };

    onMounted(() => {
      refreshUsers();
    });

    return {
      users,
      usersWithDetails,
      loading,
      error,
      selectedUser,
      showAddUserModal,
      addUserLoading,
      addUserError,
      newUser,
      activeUsersToday,
      totalHoursWorked,
      averageHoursPerDay,
      refreshUsers,
      viewUserDetails,
      editUser,
      deleteUser,
      saveNewUser,
      closeAddUserModal
    };
  }
};
</script>
