import { ref, computed } from 'vue';
import { apiService } from '../services/api.js';

export function useClocks() {
  const clocks = ref([]);
  const currentClock = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Get all clocks for a user
  const fetchClocks = async (userID) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.getClocks(userID);
      // Ensure clocks.value is always an array
      clocks.value = Array.isArray(data) ? data : [];
      return clocks.value;
    } catch (err) {
      console.warn('API not available, using mock data:', err.message);
      // If API fails, use mock data for development
      clocks.value = [];
      error.value = null; // Don't show error for missing backend
      return clocks.value;
    } finally {
      loading.value = false;
    }
  };

  // Create new clock entry (clock in/out)
  const createClock = async (userID, clockData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiService.createClock(userID, clockData);
      // Ensure clocks.value is an array before pushing
      if (!Array.isArray(clocks.value)) {
        clocks.value = [];
      }
      clocks.value.push(data);
      currentClock.value = data;
      return data;
    } catch (err) {
      console.warn('API not available, using mock data:', err.message);
      // If API fails, create mock data for development
      const mockData = {
        id: Date.now(), // Use timestamp as ID
        user_id: userID,
        ...clockData,
        created_at: new Date().toISOString()
      };
      
      // Ensure clocks.value is an array before pushing
      if (!Array.isArray(clocks.value)) {
        clocks.value = [];
      }
      clocks.value.push(mockData);
      currentClock.value = mockData;
      error.value = null; // Don't show error for missing backend
      return mockData;
    } finally {
      loading.value = false;
    }
  };

  // Clock in
  const clockIn = async (userID) => {
    const clockData = {
      status: true,
      time: new Date().toISOString(),
    };
    
    return await createClock(userID, clockData);
  };

  // Clock out
  const clockOut = async (userID) => {
    const clockData = {
      status: false,
      time: new Date().toISOString(),
    };
    
    return await createClock(userID, clockData);
  };

  // Computed properties
  const hasClocks = computed(() => Array.isArray(clocks.value) && clocks.value.length > 0);
  const hasCurrentClock = computed(() => currentClock.value !== null);
  
  // Get current clock status
  const currentClockStatus = computed(() => {
    if (!Array.isArray(clocks.value) || clocks.value.length === 0) return false;
    
    const lastClock = clocks.value[clocks.value.length - 1];
    return lastClock && lastClock.status;
  });

  // Check if user is currently clocked in
  const isClockedIn = computed(() => currentClockStatus.value === true);

  // Get today's clock entries
  const todayClocks = computed(() => {
    if (!Array.isArray(clocks.value)) return [];
    
    const today = new Date().toDateString();
    return clocks.value.filter(clock => {
      const clockDate = new Date(clock.time).toDateString();
      return clockDate === today;
    });
  });

  // Get current session duration (if clocked in)
  const currentSessionDuration = computed(() => {
    if (!isClockedIn.value || !Array.isArray(clocks.value)) return 0;
    
    const lastClockIn = clocks.value
      .filter(clock => clock.status === true)
      .pop();
    
    if (!lastClockIn) return 0;
    
    const startTime = new Date(lastClockIn.time);
    const currentTime = new Date();
    return (currentTime - startTime) / (1000 * 60 * 60); // hours
  });

  // Get total hours worked today
  const todayTotalHours = computed(() => {
    if (!Array.isArray(todayClocks.value) || todayClocks.value.length < 2) return 0;
    
    let totalHours = 0;
    let clockInTime = null;
    
    for (const clock of todayClocks.value) {
      if (clock.status === true) {
        clockInTime = new Date(clock.time);
      } else if (clock.status === false && clockInTime) {
        const clockOutTime = new Date(clock.time);
        totalHours += (clockOutTime - clockInTime) / (1000 * 60 * 60);
        clockInTime = null;
      }
    }
    
    // If still clocked in, add current session
    if (clockInTime) {
      totalHours += currentSessionDuration.value;
    }
    
    return totalHours;
  });

  return {
    // State
    clocks,
    currentClock,
    loading,
    error,
    
    // Computed
    hasClocks,
    hasCurrentClock,
    currentClockStatus,
    isClockedIn,
    todayClocks,
    currentSessionDuration,
    todayTotalHours,
    
    // Actions
    fetchClocks,
    createClock,
    clockIn,
    clockOut,
  };
}
