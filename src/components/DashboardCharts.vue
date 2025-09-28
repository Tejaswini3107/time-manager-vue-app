<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <BarChart3 class="h-5 w-5" />
          <span>This Week</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <canvas ref="weeklyChart"></canvas>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <TrendingUp class="h-5 w-5" />
          <span>Monthly Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <canvas ref="monthlyChart"></canvas>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useWorkingTime } from '../composables/useWorkingTime.js';
import { useClocks } from '../composables/useClocks.js';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import { BarChart3, TrendingUp } from 'lucide-vue-next';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default {
  name: 'DashboardCharts',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    BarChart3,
    TrendingUp
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
    
    const weeklyChart = ref(null);
    const monthlyChart = ref(null);

    // Fetch data on mount
    onMounted(async () => {
      try {
        // Get current week data
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 6);
        
        // Get current month data (last 4 weeks)
        const startOfMonth = new Date();
        startOfMonth.setDate(startOfMonth.getDate() - 28);
        
        await Promise.all([
          fetchWorkingTimes(props.userId, {
            start: startOfWeek.toISOString(),
            end: endOfWeek.toISOString()
          }),
          fetchClocks(props.userId)
        ]);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      }
    });

    // Calculate weekly data from API
    const weeklyData = computed(() => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekData = days.map(day => ({ day, hours: 0 }));
      
      workingTimes.value.forEach(wt => {
        const date = new Date(wt.start);
        const dayOfWeek = date.getDay();
        const start = new Date(wt.start);
        const end = new Date(wt.end);
        const hours = (end - start) / (1000 * 60 * 60);
        weekData[dayOfWeek].hours += hours;
      });
      
      return weekData;
    });

    // Calculate monthly data from API (last 4 weeks)
    const monthlyData = computed(() => {
      const weeks = [];
      const now = new Date();
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekHours = workingTimes.value
          .filter(wt => {
            const wtDate = new Date(wt.start);
            return wtDate >= weekStart && wtDate <= weekEnd;
          })
          .reduce((total, wt) => {
            const start = new Date(wt.start);
            const end = new Date(wt.end);
            return total + ((end - start) / (1000 * 60 * 60));
          }, 0);
        
        weeks.push({
          week: `Week ${4 - i}`,
          hours: weekHours
        });
      }
      
      return weeks;
    });

    const createWeeklyChart = () => {
      if (!weeklyChart.value) return;

      const ctx = weeklyChart.value.getContext('2d');
      new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: weeklyData.value.map(item => item.day),
          datasets: [{
            label: 'Hours Worked',
            data: weeklyData.value.map(item => item.hours),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                callback: function(value) {
                  return value + 'h';
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }
          }
        }
      });
    };

    const createMonthlyChart = () => {
      if (!monthlyChart.value) return;

      const ctx = monthlyChart.value.getContext('2d');
      new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: monthlyData.value.map(item => item.week),
          datasets: [{
            label: 'Hours Worked',
            data: monthlyData.value.map(item => item.hours),
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(34, 197, 94, 1)',
            pointBorderColor: 'rgba(34, 197, 94, 1)',
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBorderWidth: 2,
            pointBackgroundColor: 'rgba(34, 197, 94, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 50,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                callback: function(value) {
                  return value + 'h';
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }
          }
        }
      });
    };

    onMounted(async () => {
      await nextTick();
      createWeeklyChart();
      createMonthlyChart();
    });

    return {
      weeklyChart,
      monthlyChart,
      weeklyData,
      monthlyData
    };
  }
};
</script>
