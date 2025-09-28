import { ref, computed } from 'vue';
import { apiService } from '../services/api.js';

export function useUsers() {
  const users = ref([]);
  const currentUser = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Get all users with optional filters
  const fetchUsers = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.getUsers(filters);
      users.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get user by ID
  const fetchUserById = async (userID) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.getUserById(userID);
      currentUser.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create new user
  const createUser = async (userData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.createUser(userData);
      users.value.push(data);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update user
  const updateUser = async (userID, userData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.updateUser(userID, userData);
      
      // Update in users array
      const index = users.value.findIndex(user => user.id === userID);
      if (index !== -1) {
        users.value[index] = data;
      }
      
      // Update current user if it's the same
      if (currentUser.value && currentUser.value.id === userID) {
        currentUser.value = data;
      }
      
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete user
  const deleteUser = async (userID) => {
    loading.value = true;
    error.value = null;
    
    try {
      await apiService.deleteUser(userID);
      
      // Remove from users array
      users.value = users.value.filter(user => user.id !== userID);
      
      // Clear current user if it's the same
      if (currentUser.value && currentUser.value.id === userID) {
        currentUser.value = null;
      }
      
      return true;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Computed properties
  const hasUsers = computed(() => users.value.length > 0);
  const hasCurrentUser = computed(() => currentUser.value !== null);

  return {
    // State
    users,
    currentUser,
    loading,
    error,
    
    // Computed
    hasUsers,
    hasCurrentUser,
    
    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
  };
}
