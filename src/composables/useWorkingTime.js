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
      // Ensure workingTimes.value is always an array
      workingTimes.value = Array.isArray(data) ? data : [];
      return workingTimes.value;
    } catch (err) {
      error.value = err.message;
      // Set to empty array on error to prevent filter issues
      workingTimes.value = [];
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
      // Ensure workingTimes.value is an array before pushing
      if (!Array.isArray(workingTimes.value)) {
        workingTimes.value = [];
      }
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
      
      // Ensure workingTimes.value is an array before using findIndex
      if (Array.isArray(workingTimes.value)) {
        const index = workingTimes.value.findIndex(wt => wt.id === id);
        if (index !== -1) {
          workingTimes.value[index] = data;
        }
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
      
      // Remove from working times array (ensure it's an array first)
      if (Array.isArray(workingTimes.value)) {
        workingTimes.value = workingTimes.value.filter(wt => wt.id !== id);
      }
      
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
  const hasWorkingTimes = computed(() => Array.isArray(workingTimes.value) && workingTimes.value.length > 0);
  const hasCurrentWorkingTime = computed(() => currentWorkingTime.value !== null);
  
  // Calculate total hours for current period
  const totalHours = computed(() => {
    if (!Array.isArray(workingTimes.value)) return 0;
    
    return workingTimes.value.reduce((total, wt) => {
      const start = new Date(wt.start);
      const end = new Date(wt.end);
      const hours = (end - start) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  });

  // Get working times for current week
  const currentWeekWorkingTimes = computed(() => {
    if (!Array.isArray(workingTimes.value)) return [];
    
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
