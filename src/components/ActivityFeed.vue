<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center space-x-2">
        <Activity class="h-5 w-5" />
        <span>Recent Activity</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div v-for="activity in activities" :key="activity.id" class="flex items-start space-x-3">
          <div :class="`mt-1 ${activity.color}`">
            <component :is="activity.icon" class="h-4 w-4" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ activity.message }}</p>
            <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import { Activity, Clock, CheckCircle, Timer, Coffee } from 'lucide-vue-next';
import { useWorkingTime } from '../composables/useWorkingTime.js';
import { useClocks } from '../composables/useClocks.js';

export default {
  name: 'ActivityFeed',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Activity,
    Clock,
    CheckCircle
  },
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { workingTimes, fetchWorkingTimes, loading: workingTimeLoading } = useWorkingTime();
    const { clocks, fetchClocks, loading: clocksLoading } = useClocks();

    // Fetch data on mount
    onMounted(async () => {
      try {
        // Get recent data (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        await Promise.all([
          fetchWorkingTimes(props.userId, {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }),
          fetchClocks(props.userId)
        ]);
      } catch (err) {
        console.error('Failed to fetch activity data:', err);
      }
    });

    // Generate activities from API data
    const activities = computed(() => {
      const allActivities = [];

      // Add clock activities
      clocks.value.forEach((clock, index) => {
        const clockTime = new Date(clock.time);
        const timeAgo = getTimeAgo(clockTime);
        
        allActivities.push({
          id: `clock_${clock.id || index}`,
          type: clock.status === 'in' ? 'clock_in' : 'clock_out',
          message: clock.status === 'in' 
            ? `Clocked in at ${clockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : `Clocked out at ${clockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          time: timeAgo,
          icon: Clock,
          color: clock.status === 'in' ? 'text-green-500' : 'text-red-500',
          timestamp: clockTime.getTime()
        });
      });

      // Add working time activities
      workingTimes.value.forEach((wt, index) => {
        const startTime = new Date(wt.start);
        const endTime = new Date(wt.end);
        const timeAgo = getTimeAgo(startTime);
        const duration = Math.round((endTime - startTime) / (1000 * 60 * 60 * 100)) / 10; // hours with 1 decimal
        
        allActivities.push({
          id: `working_${wt.id || index}`,
          type: 'working_time',
          message: `Worked ${duration}h${wt.description ? ` - ${wt.description}` : ''}`,
          time: timeAgo,
          icon: Timer,
          color: 'text-blue-500',
          timestamp: startTime.getTime()
        });
      });

      // Sort by timestamp (most recent first) and limit to 10
      return allActivities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    });

    // Helper function to calculate time ago
    const getTimeAgo = (date) => {
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return date.toLocaleDateString();
    };

    const isLoading = computed(() => workingTimeLoading.value || clocksLoading.value);

    return {
      activities,
      isLoading,
      workingTimes,
      clocks
    };
  }
};
</script>
