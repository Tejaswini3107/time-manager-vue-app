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
import { ref, onMounted, nextTick, computed, watch } from 'vue';
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
import { apiService } from '../services/api.js';
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
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const workingTimes = ref([]);
    const clocks = ref([]);
    const loading = ref(false);
    
    const weeklyChart = ref(null);
    const monthlyChart = ref(null);

    // Fetch data on mount
    onMounted(async () => {
      try {
        loading.value = true;
        
        // Get broader date range for better data coverage
        const startOfMonth = new Date();
        startOfMonth.setDate(startOfMonth.getDate() - 35); // Get last 5 weeks of data
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 6);
        
        const [workingTimesData, clocksData] = await Promise.all([
          apiService.getWorkingTimes(props.userId, {
            start: startOfMonth.toISOString(),
            end: endOfWeek.toISOString()
          }),
          apiService.getClocks(props.userId)
        ]);
        
        workingTimes.value = Array.isArray(workingTimesData) ? workingTimesData : [];
        clocks.value = Array.isArray(clocksData) ? clocksData : [];
        
        // Create charts after data is loaded
        await nextTick();
        console.log('Creating charts with data:', {
          workingTimes: workingTimes.value.length,
          weeklyData: weeklyData.value,
          monthlyData: monthlyData.value
        });
        createWeeklyChart();
        createMonthlyChart();
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        workingTimes.value = [];
        clocks.value = [];
      } finally {
        loading.value = false;
      }
    });

    // Calculate weekly data from API (current week only)
    const weeklyData = computed(() => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekData = days.map(day => ({ day, hours: 0 }));
      
      // Get current week boundaries
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Filter working times for current week only
      const currentWeekTimes = workingTimes.value.filter(wt => {
        const wtDate = new Date(wt.start);
        return wtDate >= startOfWeek && wtDate <= endOfWeek;
      });
      
      currentWeekTimes.forEach(wt => {
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

      // Destroy existing chart if it exists
      if (weeklyChart.value.chart) {
        weeklyChart.value.chart.destroy();
      }

      const ctx = weeklyChart.value.getContext('2d');
      weeklyChart.value.chart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: weeklyData.value.map(item => item.day),
          datasets: [{
            label: 'Hours Worked',
            data: weeklyData.value.map(item => item.hours),
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 24,
            maxBarThickness: 32,
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
              borderWidth: 1,
              titleFont: {
                size: 12
              },
              bodyFont: {
                size: 11
              },
              padding: 8,
              cornerRadius: 6,
              displayColors: false,
              callbacks: {
                title: function(context) {
                  return context[0].label;
                },
                label: function(context) {
                  const hours = context.parsed.y;
                  return `${hours.toFixed(1)} hours`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 12,
              title: {
                display: true,
                text: '⏰ Hours Worked',
                color: '#8B5CF6',
                font: {
                  size: 16,
                  weight: 'bold',
                  family: 'Inter, system-ui, sans-serif'
                },
                padding: { bottom: 25 }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                drawBorder: false
              },
              ticks: {
                color: '#A78BFA',
                font: {
                  size: 14,
                  weight: '600',
                  family: 'Inter, system-ui, sans-serif'
                },
                stepSize: 3,
                maxTicksLimit: 5,
                callback: function(value) {
                  return value + 'h';
                }
              }
            },
            x: {
              title: {
                display: true,
                text: '📅 Days of the Week',
                color: '#60A5FA',
                font: {
                  size: 18,
                  weight: 'bold',
                  family: 'Inter, system-ui, sans-serif'
                },
                padding: { top: 30 }
              },
              grid: {
                display: false
              },
              ticks: {
                color: '#FBBF24',
                font: {
                  size: 18,
                  weight: 'bold',
                  family: 'Inter, system-ui, sans-serif'
                },
                maxRotation: 0,
                minRotation: 0,
                padding: 15,
                backdropColor: 'rgba(0, 0, 0, 0.3)',
                backdropPadding: 4
              }
            }
          }
        }
      });
    };

    const createMonthlyChart = () => {
      if (!monthlyChart.value) return;

      // Destroy existing chart if it exists
      if (monthlyChart.value.chart) {
        monthlyChart.value.chart.destroy();
      }

      const ctx = monthlyChart.value.getContext('2d');
      monthlyChart.value.chart = new ChartJS(ctx, {
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
              borderWidth: 1,
              titleFont: {
                size: 12
              },
              bodyFont: {
                size: 11
              },
              padding: 8,
              cornerRadius: 6,
              displayColors: false,
              callbacks: {
                title: function(context) {
                  return 'Week ' + context[0].label;
                },
                label: function(context) {
                  const hours = context.parsed.y;
                  return `${hours.toFixed(1)} hours`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 50,
              title: {
                display: true,
                text: '📈 Weekly Hours',
                color: '#EC4899',
                font: {
                  size: 16,
                  weight: 'bold',
                  family: 'Inter, system-ui, sans-serif'
                },
                padding: { bottom: 25 }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                drawBorder: false
              },
              ticks: {
                color: '#F472B6',
                font: {
                  size: 14,
                  weight: '600',
                  family: 'Inter, system-ui, sans-serif'
                },
                stepSize: 10,
                maxTicksLimit: 6,
                callback: function(value) {
                  return value + 'h';
                }
              }
            },
            x: {
              title: {
                display: true,
                text: '📊 Weekly Progress',
                color: '#10B981',
                font: {
                  size: 18,
                  weight: 'bold',
                  family: 'Inter, system-ui, sans-serif'
                },
                padding: { top: 30 }
              },
              grid: {
                display: false
              },
              ticks: {
                color: '#F59E0B',
                font: {
                  size: 18,
                  weight: 'bold',
                  family: 'Inter, system-ui, sans-serif'
                },
                maxRotation: 0,
                minRotation: 0,
                padding: 15,
                backdropColor: 'rgba(0, 0, 0, 0.3)',
                backdropPadding: 4
              }
            }
          }
        }
      });
    };

    // Watch for data changes and update charts
    watch(weeklyData, () => {
      if (weeklyChart.value && weeklyChart.value.chart) {
        weeklyChart.value.chart.data.labels = weeklyData.value.map(item => item.day);
        weeklyChart.value.chart.data.datasets[0].data = weeklyData.value.map(item => item.hours);
        weeklyChart.value.chart.update();
      }
    }, { deep: true });

    watch(monthlyData, () => {
      if (monthlyChart.value && monthlyChart.value.chart) {
        monthlyChart.value.chart.data.labels = monthlyData.value.map(item => item.week);
        monthlyChart.value.chart.data.datasets[0].data = monthlyData.value.map(item => item.hours);
        monthlyChart.value.chart.update();
      }
    }, { deep: true });

    return {
      weeklyChart,
      monthlyChart,
      weeklyData,
      monthlyData,
      loading
    };
  }
};
</script>
