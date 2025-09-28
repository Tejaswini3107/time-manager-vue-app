import { ref, computed } from 'vue';
import { apiService } from '../services/api.js';

export function useWorkingTime() {
  const workingTimes = ref([]);
  const currentWorkingTime = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Get all working times for a user with optional date filters
  const fetchWorkingTimes = async (userID, filters = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.getWorkingTimes(userID, filters);
      workingTimes.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get working time by ID
  const fetchWorkingTimeById = async (userID, id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.getWorkingTimeById(userID, id);
      currentWorkingTime.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create new working time entry
  const createWorkingTime = async (userID, workingTimeData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.createWorkingTime(userID, workingTimeData);
      workingTimes.value.push(data);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update working time entry
  const updateWorkingTime = async (id, workingTimeData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.updateWorkingTime(id, workingTimeData);
      
      // Update in working times array
      const index = workingTimes.value.findIndex(wt => wt.id === id);
      if (index !== -1) {
        workingTimes.value[index] = data;
      }
      
      // Update current working time if it's the same
      if (currentWorkingTime.value && currentWorkingTime.value.id === id) {
        currentWorkingTime.value = data;
      }
      
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete working time entry
  const deleteWorkingTime = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      await apiService.deleteWorkingTime(id);
      
      // Remove from working times array
      workingTimes.value = workingTimes.value.filter(wt => wt.id !== id);
      
      // Clear current working time if it's the same
      if (currentWorkingTime.value && currentWorkingTime.value.id === id) {
        currentWorkingTime.value = null;
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
  const hasWorkingTimes = computed(() => workingTimes.value.length > 0);
  const hasCurrentWorkingTime = computed(() => currentWorkingTime.value !== null);
  
  // Calculate total hours for current period
  const totalHours = computed(() => {
    return workingTimes.value.reduce((total, wt) => {
      const start = new Date(wt.start);
      const end = new Date(wt.end);
      const hours = (end - start) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  });

  // Get working times for current week
  const currentWeekWorkingTimes = computed(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    return workingTimes.value.filter(wt => {
      const workingDate = new Date(wt.start);
      return workingDate >= startOfWeek && workingDate <= endOfWeek;
    });
  });

  return {
    // State
    workingTimes,
    currentWorkingTime,
    loading,
    error,
    
    // Computed
    hasWorkingTimes,
    hasCurrentWorkingTime,
    totalHours,
    currentWeekWorkingTimes,
    
    // Actions
    fetchWorkingTimes,
    fetchWorkingTimeById,
    createWorkingTime,
    updateWorkingTime,
    deleteWorkingTime,
  };
}
