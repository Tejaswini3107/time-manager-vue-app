<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle class="flex items-center space-x-2">
        <Clock class="h-5 w-5" />
        <span>Time Clock</span>
        <Badge :variant="clockedIn ? 'default' : 'secondary'">
          {{ clockedIn ? "Active" : "Inactive" }}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="text-center">
        <div class="text-3xl font-mono mb-2">
          {{ currentTime.toLocaleTimeString() }}
        </div>
        <div class="text-sm text-muted-foreground">
          {{ currentTime.toLocaleDateString() }}
        </div>
      </div>

      <div v-if="clockedIn" class="bg-muted/50 p-4 rounded-lg text-center">
        <div class="text-sm text-muted-foreground mb-1">Time Worked Today</div>
        <div class="text-2xl font-mono">{{ formatTime(workedTime) }}</div>
        <div class="text-xs text-muted-foreground mt-1">
          Started at: {{ startDateTime ? new Date(startDateTime).toLocaleTimeString() : '' }}
        </div>
      </div>

      <div class="flex space-x-2">
        <Button 
          @click="clock" 
          class="flex-1"
          :variant="clockedIn ? 'destructive' : 'default'"
        >
          <Square v-if="clockedIn" class="h-4 w-4 mr-2" />
          <Play v-else class="h-4 w-4 mr-2" />
          {{ clockedIn ? 'Clock Out' : 'Clock In' }}
        </Button>
        <!-- <Button variant="outline" @click="refresh">
          Refresh
        </Button> -->
      </div>

      <div class="text-xs text-muted-foreground">
        <p>User ID: {{ userId }}</p>
        <p>Status: {{ clockedIn ? 'Working' : 'Not working' }}</p>
      </div>
    </CardContent>
  </Card>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Button from './ui/button.vue';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import Badge from './ui/badge.vue';
import { Clock, Play, Square } from 'lucide-vue-next';
import { useClocks } from '../composables/useClocks.js';

export default {
  name: 'ClockManager',
  components: {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Clock,
    Play,
    Square
  },
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const {
      clocks,
      loading,
      error,
      isClockedIn,
      todayTotalHours,
      currentSessionDuration,
      fetchClocks,
      clockIn,
      clockOut
    } = useClocks();

    const currentTime = ref(new Date());
    let timer = null;

    const formatTime = (hours) => {
      const totalSeconds = Math.floor(hours * 3600);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatHours = (hours) => {
      const h = Math.floor(hours);
      const m = Math.floor((hours - h) * 60);
      return `${h}h ${m}m`;
    };

    const clock = async () => {
      try {
        console.log('Clock operation started. Current status:', isClockedIn.value);
        console.log('User ID:', props.userId);
        
        if (isClockedIn.value) {
          console.log('Attempting to clock out...');
          await clockOut(props.userId);
          console.log('Clocked out successfully');
        } else {
          console.log('Attempting to clock in...');
          await clockIn(props.userId);
          console.log('Clocked in successfully');
        }
        
        // Refresh clock data after successful operation
        console.log('Refreshing clock data...');
        await fetchClocks(props.userId);
        console.log('Clock data refreshed. New status:', isClockedIn.value);
        console.log('Total clocks:', clocks.value.length);
      } catch (err) {
        console.error('Clock operation failed:', err);
        alert(`Clock operation failed: ${err.message}`);
      }
    };

    const refresh = async () => {
      try {
        await fetchClocks(props.userId);
        currentTime.value = new Date();
        console.log('Clock data refreshed successfully');
      } catch (err) {
        console.error('Failed to refresh clock data:', err);
        alert(`Failed to refresh clock data: ${err.message}`);
      }
    };

    onMounted(async () => {
      // Fetch initial clock data
      try {
        console.log('Fetching initial clock data for user:', props.userId);
        await fetchClocks(props.userId);
        console.log('Initial clock data loaded successfully');
        console.log('Initial clock status:', isClockedIn.value);
        console.log('Initial clocks count:', clocks.value.length);
      } catch (err) {
        console.error('Failed to fetch initial clock data:', err);
        // Don't show alert for missing backend, just log the error
        console.log('Continuing with mock data...');
      }
      
      // Start timer for clock display
      timer = setInterval(() => {
        currentTime.value = new Date();
      }, 1000);
    });

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
      }
    });

    return {
      clockedIn: isClockedIn,
      currentTime,
      workedTime: computed(() => todayTotalHours.value),
      currentSessionDuration,
      loading,
      error,
      clock,
      refresh,
      formatTime,
      formatHours
    };
  }
};
</script>
