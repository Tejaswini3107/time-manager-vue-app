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
      clocks.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
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
      clocks.value.push(data);
      currentClock.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
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
  const hasClocks = computed(() => clocks.value.length > 0);
  const hasCurrentClock = computed(() => currentClock.value !== null);
  
  // Get current clock status
  const currentClockStatus = computed(() => {
    if (!hasClocks.value) return false;
    
    const lastClock = clocks.value[clocks.value.length - 1];
    return lastClock.status;
  });

  // Check if user is currently clocked in
  const isClockedIn = computed(() => currentClockStatus.value === true);

  // Get today's clock entries
  const todayClocks = computed(() => {
    const today = new Date().toDateString();
    return clocks.value.filter(clock => {
      const clockDate = new Date(clock.time).toDateString();
      return clockDate === today;
    });
  });

  // Get current session duration (if clocked in)
  const currentSessionDuration = computed(() => {
    if (!isClockedIn.value) return 0;
    
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
    if (todayClocks.value.length < 2) return 0;
    
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
