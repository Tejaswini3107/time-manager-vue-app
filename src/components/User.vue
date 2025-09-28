<template>
  <Card class="w-full">
    <CardHeader class="flex flex-row items-center space-y-0 pb-4">
      <div class="flex items-center space-x-4 flex-1">
        <div class="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
          <UserIcon class="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <CardTitle class="text-lg">{{ currentUser.name || 'Loading...' }}</CardTitle>
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
          @click="navigateToUsers"
          title="View All Users"
        >
          <Users class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="text-sm text-muted-foreground">
        <p>Email: {{ currentUser.email || 'Loading...' }}</p>
        <p>User ID: {{ currentUser.id || 'Loading...' }}</p>
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


  </Card>
</template>

<script>
import { ref, watch, computed, onMounted } from 'vue';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import Button from './ui/button.vue';
import Input from './ui/input.vue';
import Label from './ui/label.vue';
import { User as UserIcon, Edit, Users } from 'lucide-vue-next';
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
  emits: ['navigate-to-users'],
  setup(props, { emit }) {
    const { 
      updateUser: updateUserAPI,
      fetchUserById
    } = useUsers();
    
    const isEditOpen = ref(false);
    const currentUser = ref({ ...props.currentUser });
    const editUser = ref({ ...props.currentUser });
    const loading = ref(false);
    const error = ref(null);


    // Load user data from API
    const loadUserData = async () => {
      try {
        loading.value = true;
        error.value = null;
        console.log('Loading user data for ID:', props.currentUser.id);
        
        const userData = await fetchUserById(props.currentUser.id);
        console.log('Fetched user data:', userData);
        
        currentUser.value = userData;
        editUser.value = { ...userData };
        
        // Update parent component with fetched data
        props.onUserUpdate(userData);
      } catch (err) {
        console.error('Failed to load user data:', err);
        error.value = err.message;
        // Keep current props data if API fails
        currentUser.value = { ...props.currentUser };
        editUser.value = { ...props.currentUser };
      } finally {
        loading.value = false;
      }
    };

    watch(() => props.currentUser, (newUser) => {
      currentUser.value = { ...newUser };
      editUser.value = { ...newUser };
    }, { deep: true });

    const updateUser = async () => {
      try {
        const updatedUser = await updateUserAPI(currentUser.value.id, editUser.value);
        currentUser.value = updatedUser;
        props.onUserUpdate(updatedUser);
        isEditOpen.value = false;
      } catch (err) {
        console.error('Failed to update user via API:', err);
        alert(`Failed to update user: ${err.message}`);
      }
    };

    // Navigate to users page
    const navigateToUsers = () => {
      emit('navigate-to-users');
    };

    // Load user data when component mounts
    onMounted(() => {
      loadUserData();
    });

    return {
      isEditOpen,
      currentUser,
      editUser,
      loading,
      error,
      updateUser,
      navigateToUsers,
      loadUserData
    };
  }
};
</script>
