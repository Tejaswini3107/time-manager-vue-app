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
import { apiService } from '../services/api.js';

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
    const workingTimes = ref([]);
    const clocks = ref([]);
    const loading = ref(false);

    // Computed properties
    const totalHours = computed(() => {
      if (!Array.isArray(workingTimes.value)) return 0;
      return workingTimes.value.reduce((total, entry) => {
        const start = new Date(entry.start);
        const end = new Date(entry.end);
        const hours = (end - start) / (1000 * 60 * 60);
        return total + (isNaN(hours) ? 0 : hours);
      }, 0);
    });

    const currentWeekWorkingTimes = computed(() => {
      if (!Array.isArray(workingTimes.value)) return [];
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() - now.getDay() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return workingTimes.value.filter(entry => {
        const entryDate = new Date(entry.start);
        return entryDate >= startOfWeek && entryDate <= endOfWeek;
      });
    });

    const todayClocks = computed(() => {
      if (!Array.isArray(clocks.value)) return [];
      const today = new Date().toISOString().split('T')[0];
      return clocks.value.filter(clock => {
        const clockDate = new Date(clock.time).toISOString().split('T')[0];
        return clockDate === today;
      });
    });

    const todayTotalHours = computed(() => {
      if (!Array.isArray(todayClocks.value)) return 0;
      let totalHours = 0;
      for (let i = 0; i < todayClocks.value.length; i += 2) {
        const clockIn = todayClocks.value[i];
        const clockOut = todayClocks.value[i + 1];
        if (clockIn && clockOut) {
          const startTime = new Date(clockIn.time);
          const endTime = new Date(clockOut.time);
          totalHours += (endTime - startTime) / (1000 * 60 * 60);
        }
      }
      return totalHours;
    });

    const isClockedIn = computed(() => {
      if (!Array.isArray(clocks.value) || clocks.value.length === 0) return false;
      const lastClock = clocks.value[clocks.value.length - 1];
      return lastClock && lastClock.status === true;
    });

    // Fetch data on mount
    onMounted(async () => {
      try {
        loading.value = true;
        
        // Get current week data
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 6);
        
        const [workingTimesData, clocksData] = await Promise.all([
          apiService.getWorkingTimes(props.userId, {
            start: startOfWeek.toISOString(),
            end: endOfWeek.toISOString()
          }),
          apiService.getClocks(props.userId)
        ]);
        
        workingTimes.value = Array.isArray(workingTimesData) ? workingTimesData : [];
        clocks.value = Array.isArray(clocksData) ? clocksData : [];
      } catch (err) {
        console.error('Failed to fetch metrics data:', err);
        workingTimes.value = [];
        clocks.value = [];
      } finally {
        loading.value = false;
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

    return {
      metrics,
      loading,
      workingTimes,
      todayTotalHours,
      isClockedIn
    };
  }
};
</script>
