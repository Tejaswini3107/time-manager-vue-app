<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card v-for="metric in metrics" :key="metric.title">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          {{ metric.title }}
        </CardTitle>
        <component :is="metric.icon" :class="`h-4 w-4 ${metric.color}`" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ metric.value }}</div>
        <p class="text-xs text-muted-foreground">
          <span class="text-green-500">{{ metric.change }}</span> from last period
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import { Clock, Calendar, TrendingUp, Target } from 'lucide-vue-next';
import { useWorkingTime } from '../composables/useWorkingTime.js';
import { useClocks } from '../composables/useClocks.js';

export default {
  name: 'MetricsCards',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Clock,
    Calendar,
    TrendingUp,
    Target
  },
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const { workingTimes, totalHours, currentWeekWorkingTimes, fetchWorkingTimes, loading: workingTimeLoading } = useWorkingTime();
    const { todayTotalHours, isClockedIn, fetchClocks, loading: clocksLoading } = useClocks();

    // Fetch data on mount
    onMounted(async () => {
      try {
        // Get current week data
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 6);
        
        await Promise.all([
          fetchWorkingTimes(props.userId, {
            start: startOfWeek.toISOString(),
            end: endOfWeek.toISOString()
          }),
          fetchClocks(props.userId)
        ]);
      } catch (err) {
        console.error('Failed to fetch metrics data:', err);
      }
    });

    // Calculate metrics from API data
    const metrics = computed(() => {
      const todayHours = todayTotalHours.value || 0;
      const weekHours = currentWeekWorkingTimes.value.reduce((total, wt) => {
        const start = new Date(wt.start);
        const end = new Date(wt.end);
        const hours = (end - start) / (1000 * 60 * 60);
        return total + hours;
      }, 0);

      // Calculate productivity based on working hours vs expected hours
      const expectedDailyHours = 8;
      const expectedWeeklyHours = 40;
      const productivity = weekHours > 0 ? Math.min(100, Math.round((weekHours / expectedWeeklyHours) * 100)) : 0;
      
      // Calculate goals met (simplified - based on hours worked)
      const goalsMet = Math.min(10, Math.floor(weekHours / 4)); // 1 goal per 4 hours worked

      return [
        {
          title: 'Today\'s Hours',
          value: `${todayHours.toFixed(1)}h`,
          change: todayHours > 8 ? `+${(todayHours - 8).toFixed(1)}h` : `${(todayHours - 8).toFixed(1)}h`,
          icon: Clock,
          color: 'text-blue-500'
        },
        {
          title: 'This Week',
          value: `${weekHours.toFixed(1)}h`,
          change: weekHours > 40 ? `+${(weekHours - 40).toFixed(1)}h` : `${(weekHours - 40).toFixed(1)}h`,
          icon: Calendar,
          color: 'text-green-500'
        },
        {
          title: 'Productivity',
          value: `${productivity}%`,
          change: productivity > 100 ? `+${productivity - 100}%` : `${productivity - 100}%`,
          icon: TrendingUp,
          color: 'text-purple-500'
        },
        {
          title: 'Goals Met',
          value: `${goalsMet}/10`,
          change: goalsMet > 8 ? `+${goalsMet - 8}` : `${goalsMet - 8}`,
          icon: Target,
          color: 'text-orange-500'
        }
      ];
    });

    const isLoading = computed(() => workingTimeLoading.value || clocksLoading.value);

    return {
      metrics,
      isLoading,
      workingTimes,
      todayTotalHours,
      isClockedIn
    };
  }
};
</script>
