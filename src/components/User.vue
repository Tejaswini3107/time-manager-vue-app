<template>
  <Card class="w-full">
    <CardHeader class="flex flex-row items-center space-y-0 pb-4">
      <div class="flex items-center space-x-4 flex-1">
        <div class="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
          <UserIcon class="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <CardTitle class="text-lg">{{ currentUser.name }}</CardTitle>
          <p class="text-sm text-muted-foreground">User</p>
        </div>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" size="sm" @click="isEditOpen = true">
          <Edit class="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          @click="openCreateUserModal"
          title="Add New User"
        >
          <Plus class="h-4 w-4" />
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          @click="deleteUser"
          title="Delete User"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          @click="openUserList"
          title="View All Users"
        >
          <Users class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="text-sm text-muted-foreground">
        <p>Email: {{ currentUser.email }}</p>
        <p>User ID: {{ currentUser.id }}</p>
      </div>
    </CardContent>

    <!-- Edit Modal -->
    <div v-if="isEditOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-background p-6 rounded-lg w-96">
        <h2 class="text-lg font-semibold mb-4">Edit User</h2>
        <div class="space-y-4">
          <div>
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="editUser.name"
            />
          </div>
          <div>
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="editUser.email"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-6">
          <Button variant="outline" @click="isEditOpen = false">
            Cancel
          </Button>
          <Button @click="updateUser">Save Changes</Button>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-background p-6 rounded-lg w-96">
        <h2 class="text-lg font-semibold mb-4">Create New User</h2>
        <div class="space-y-4">
          <div>
            <Label for="newUserName">Username *</Label>
            <Input
              id="newUserName"
              v-model="newUser.username"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <Label for="newUserEmail">Email *</Label>
            <Input
              id="newUserEmail"
              type="email"
              v-model="newUser.email"
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <Label for="newUserPassword">Password *</Label>
            <Input
              id="newUserPassword"
              type="password"
              v-model="newUser.password"
              placeholder="Enter password"
              required
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-6">
          <Button variant="outline" @click="closeCreateUserModal">
            Cancel
          </Button>
          <Button @click="createNewUser" :disabled="!isCreateFormValid || creatingUser">
            <span v-if="creatingUser">Creating...</span>
            <span v-else>Create User</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- User List Modal -->
    <div v-if="showUserList" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-background p-6 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">All Users</h2>
          <Button variant="outline" @click="showUserList = false">
            Close
          </Button>
        </div>
        
        <div v-if="loading" class="text-center py-8">
          <div class="text-muted-foreground">Loading users...</div>
        </div>
        
        <div v-else-if="error" class="text-center py-8">
          <div class="text-red-500">Error loading users: {{ error }}</div>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card v-for="user in allUsers" :key="user.id" class="relative">
            <CardHeader class="pb-3">
              <div class="flex items-center space-x-3">
                <div class="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                  <UserIcon class="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle class="text-base">{{ user.name }}</CardTitle>
                  <!-- <p class="text-sm text-muted-foreground">{{ user.role }}</p> -->
                </div>
              </div>
            </CardHeader>
            <CardContent class="pt-0">
              <div class="text-sm text-muted-foreground space-y-1">
                <p>Email: {{ user.email }}</p>
                <p>ID: {{ user.id }}</p>
              </div>
              <div class="flex space-x-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  @click="editUserInList(user)"
                  class="flex-1"
                >
                  <Edit class="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  @click="deleteUserInList(user.id)"
                  class="flex-1"
                >
                  <Trash2 class="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div v-if="!loading && !error && allUsers.length === 0" class="text-center py-8">
          <div class="text-muted-foreground">No users found</div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
import { ref, watch, computed } from 'vue';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import Button from './ui/button.vue';
import Input from './ui/input.vue';
import Label from './ui/label.vue';
import { User as UserIcon, Edit, Trash2, Plus, Users } from 'lucide-vue-next';
import { useUsers } from '../composables/useUsers.js';

export default {
  name: 'User',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Label,
    UserIcon,
    Edit,
    Trash2,
    Plus,
    Users
  },
  props: {
    currentUser: {
      type: Object,
      required: true
    },
    onUserUpdate: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const { 
      users: allUsers, 
      createUser: createUserAPI, 
      updateUser: updateUserAPI, 
      deleteUser: deleteUserAPI, 
      fetchUsers,
      loading, 
      error 
    } = useUsers();
    
    const isEditOpen = ref(false);
    const showUserList = ref(false);
    const showCreateUserModal = ref(false);
    const creatingUser = ref(false);
    const editUser = ref({ ...props.currentUser });
    
    // New user form data
    const newUser = ref({
      username: '',
      email: '',
      password: ''
    });


    // Form validation for create user
    const isCreateFormValid = computed(() => {
      return newUser.value.username.trim() !== '' &&
             newUser.value.email.trim() !== '' &&
             newUser.value.password.trim() !== '' &&
             newUser.value.password.length >= 6;
    });

    watch(() => props.currentUser, (newUser) => {
      editUser.value = { ...newUser };
    }, { deep: true });

    // Open create user modal
    const openCreateUserModal = () => {
      showCreateUserModal.value = true;
    };

    // Close create user modal
    const closeCreateUserModal = () => {
      showCreateUserModal.value = false;
      // Reset form
      newUser.value = {
        username: '',
        email: '',
        password: ''
      };
      creatingUser.value = false;
    };

    // Create new user
    const createNewUser = async () => {
      console.log('Create user button clicked!');
      console.log('Form data:', newUser.value);
      console.log('Form valid:', isCreateFormValid.value);
      
      if (!isCreateFormValid.value) {
        alert('Please fill in all required fields. Password must be at least 6 characters.');
        return;
      }

      creatingUser.value = true;

      try {
        const userData = {
          username: newUser.value.username.trim(),
          email: newUser.value.email.trim(),
          password: newUser.value.password
        };
        
        const createdUser = await createUserAPI(userData);
        
        // Show success message
        alert(`User "${createdUser.username}" created successfully!`);
        
        // Close modal and reset form
        closeCreateUserModal();
        
        // Refresh user list if it's open
        if (showUserList.value) {
          await fetchUsers();
        }
        
        // If this is the first user or we want to switch to the new user
        // props.onUserUpdate(createdUser);
        
      } catch (err) {
        console.error('Failed to create user via API:', err);
        alert(`Failed to create user: ${err.message}`);
      } finally {
        creatingUser.value = false;
      }
    };

    const updateUser = async () => {
      try {
        const updatedUser = await updateUserAPI(props.currentUser.id, editUser.value);
        props.onUserUpdate(updatedUser);
        isEditOpen.value = false;
      } catch (err) {
        console.error('Failed to update user via API:', err);
        alert(`Failed to update user: ${err.message}`);
      }
    };

    const deleteUser = async () => {
      if (!isManager.value) {
        alert('Only managers can delete users.');
        return;
      }

      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await deleteUserAPI(props.currentUser.id);
          console.log('User deleted successfully');
          // Refresh user list if it's open
          if (showUserList.value) {
            await fetchUsers();
          }
        } catch (err) {
          console.error('Failed to delete user via API:', err);
          alert(`Failed to delete user: ${err.message}`);
        }
      }
    };

    // Functions for user list management
    const editUserInList = (user) => {
      editUser.value = { ...user };
      isEditOpen.value = true;
      showUserList.value = false;
    };

    const deleteUserInList = async (userId) => {
      if (!isManager.value) {
        alert('Only managers can delete users.');
        return;
      }

      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await deleteUserAPI(userId);
          console.log('User deleted successfully');
          await fetchUsers(); // Refresh the list
        } catch (err) {
          console.error('Failed to delete user via API:', err);
          alert(`Failed to delete user: ${err.message}`);
        }
      }
    };

    // Load all users when user list is opened
    const openUserList = async () => {
      if (!isManager.value) {
        alert('Only managers can view all users.');
        return;
      }
      
      showUserList.value = true;
      try {
        await fetchUsers();
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    return {
      isEditOpen,
      showUserList,
      showCreateUserModal,
      creatingUser,
      editUser,
      newUser,
      isCreateFormValid,
      allUsers,
      openCreateUserModal,
      closeCreateUserModal,
      createNewUser,
      updateUser,
      deleteUser,
      editUserInList,
      deleteUserInList,
      openUserList,
      loading,
      error
    };
  }
};
</script>
