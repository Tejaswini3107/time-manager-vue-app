<template>
  <div class="space-y-6">
    <!-- Analytics Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <BarChart3 class="h-6 w-6 text-primary" />
        <h1 class="text-2xl font-bold">Analytics</h1>
      </div>
      <div class="flex items-center space-x-4">
        <div class="text-sm text-muted-foreground">
          {{ currentDate }} | {{ currentTime }}
        </div>
        <Button variant="outline" size="sm">
          <Share class="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>

    <!-- Analytics Dashboard Title -->
    <div class="text-center">
      <h2 class="text-3xl font-bold mb-4">Analytics Dashboard</h2>
      
      <!-- Chart Type Selector -->
      <div class="flex items-center justify-center space-x-4 mb-6">
        <div class="flex bg-muted rounded-lg p-1">
          <button
            v-for="chartType in chartTypes"
            :key="chartType.value"
            @click="selectedChartType = chartType.value"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedChartType === chartType.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`"
          >
            {{ chartType.label }}
          </button>
        </div>
        <div class="relative">
          <select
            v-model="selectedTimeRange"
            class="w-40 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown class="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Working Hours Overview -->
    <Card>
      <CardHeader>
        <CardTitle class="text-xl">Working Hours Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-80">
          <canvas ref="workingHoursChart"></canvas>
        </div>
      </CardContent>
    </Card>

    <!-- Summary Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent class="p-6 text-center">
          <div class="text-3xl font-bold text-primary mb-2">{{ totalHours }}h</div>
          <div class="text-sm text-muted-foreground">Total Hours This Week</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6 text-center">
          <div class="text-3xl font-bold text-orange-500 mb-2">{{ overtimeHours }}h</div>
          <div class="text-sm text-muted-foreground">Overtime Hours</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6 text-center">
          <div class="text-3xl font-bold text-green-500 mb-2">{{ averageHours }}h</div>
          <div class="text-sm text-muted-foreground">Average Daily Hours</div>
        </CardContent>
      </Card>
    </div>

    <!-- Footer -->
    <div class="text-center text-sm text-muted-foreground">
      Analytics for User ID: {{ userId }} 
    </div>
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
  Filler,
  ArcElement,
  DoughnutController,
  RadialLinearScale,
  RadarController
} from 'chart.js';
import { useWorkingTime } from '../composables/useWorkingTime.js';
import { useClocks } from '../composables/useClocks.js';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import Button from './ui/button.vue';
import Input from './ui/input.vue';
import { BarChart3, TrendingUp, Share, ChevronDown } from 'lucide-vue-next';

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
  Filler,
  ArcElement,
  DoughnutController,
  RadialLinearScale,
  RadarController
);

export default {
  name: 'ChartManager',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    BarChart3,
    TrendingUp,
    Share,
    ChevronDown
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
    
    const workingHoursChart = ref(null);
    const selectedChartType = ref('bar');
    const selectedTimeRange = ref('week');
    
    // Chart type options
    const chartTypes = ref([
      { label: 'Bar Chart', value: 'bar' },
      { label: 'Line Chart', value: 'line' },
      { label: 'Pie Chart', value: 'pie' },
      { label: 'Radar Chart', value: 'radar' }
    ]);
    
    // Current date and time
    const currentDate = computed(() => new Date().toLocaleDateString('en-GB'));
    const currentTime = computed(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Fetch data on mount
    onMounted(async () => {
      try {
        await fetchData();
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      }
    });

    // Fetch data based on selected time range
    const fetchData = async () => {
      try {
        let startDate, endDate;
        
        if (selectedTimeRange.value === 'week') {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - startDate.getDay());
          endDate = new Date();
          endDate.setDate(endDate.getDate() - endDate.getDay() + 6);
        } else {
          // Month - last 4 weeks
          endDate = new Date();
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 28);
        }
        
        await Promise.all([
          fetchWorkingTimes(props.userId, {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }),
          fetchClocks(props.userId)
        ]);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    
    // Working hours data for different time ranges
    const workingHoursData = computed(() => {
      if (selectedTimeRange.value === 'week') {
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
      } else {
        // Monthly data (4 weeks)
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
      }
    });

    // Line chart data (productivity trend) - calculated from API data
    const lineChartData = computed(() => {
      if (selectedTimeRange.value === 'week') {
        // Calculate productivity based on actual working hours vs expected (8 hours per day)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => {
          const dayData = workingHoursData.value.find(d => d.day === day);
          const hours = dayData ? dayData.hours : 0;
          const productivity = Math.min(100, Math.round((hours / 8) * 100));
          return { day, productivity };
        });
      } else {
        // Monthly data (4 weeks) - calculate from working hours data
        return workingHoursData.value.map((week, index) => {
          const productivity = Math.min(100, Math.round((week.hours / 40) * 100)); // 40 hours expected per week
          return { week: `Week ${index + 1}`, productivity };
        });
      }
    });

    // Pie chart data (time breakdown by category) - calculated from API data
    const pieChartData = computed(() => {
      const totalHours = workingHoursData.value.reduce((sum, item) => sum + item.hours, 0);
      
      if (totalHours === 0) {
        return [
          { category: 'No Data', hours: 0, color: '#6b7280' }
        ];
      }
      
      // Since we don't have category data from the API, we'll show a simple breakdown
      // based on working hours distribution across days/weeks
      if (selectedTimeRange.value === 'week') {
        const workingDays = workingHoursData.value.filter(day => day.hours > 0);
        const avgHoursPerDay = workingDays.length > 0 ? totalHours / workingDays.length : 0;
        
        return [
          { category: 'Working Hours', hours: totalHours, color: '#3b82f6' },
          { category: 'Average/Day', hours: avgHoursPerDay, color: '#10b981' },
          { category: 'Working Days', hours: workingDays.length, color: '#f59e0b' }
        ];
      } else {
        // Monthly data - show weekly breakdown
        return workingHoursData.value.map((week, index) => ({
          category: `Week ${index + 1}`,
          hours: week.hours,
          color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]
        }));
      }
    });

    // Radar chart data (performance metrics) - calculated from API data
    const radarChartData = computed(() => {
      const totalHours = workingHoursData.value.reduce((sum, item) => sum + item.hours, 0);
      const workingDays = workingHoursData.value.filter(day => day.hours > 0).length;
      const expectedDays = selectedTimeRange.value === 'week' ? 5 : 20; // 5 days per week, 20 days per month
      const expectedHours = selectedTimeRange.value === 'week' ? 40 : 160; // 40 hours per week, 160 hours per month
      
      // Calculate metrics based on actual data
      const punctuality = workingDays > 0 ? Math.min(100, Math.round((workingDays / expectedDays) * 100)) : 0;
      const productivity = totalHours > 0 ? Math.min(100, Math.round((totalHours / expectedHours) * 100)) : 0;
      const consistency = workingDays > 0 ? Math.min(100, Math.round((workingDays / expectedDays) * 100)) : 0;
      const overtime = totalHours > expectedHours ? Math.min(100, Math.round(((totalHours - expectedHours) / expectedHours) * 100)) : 0;
      const breakCompliance = workingDays > 0 ? Math.min(100, Math.round((workingDays / expectedDays) * 100)) : 0;
      
      return {
        labels: ['Punctuality', 'Productivity', 'Consistency', 'Overtime', 'Break Compliance'],
        datasets: [{
          label: 'Performance Metrics',
          data: [punctuality, productivity, consistency, overtime, breakCompliance],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      };
    });
    
    // Computed statistics
    const totalHours = computed(() => {
      return workingHoursData.value.reduce((sum, item) => sum + item.hours, 0).toFixed(1);
    });
    
    const overtimeHours = computed(() => {
      if (selectedTimeRange.value === 'week') {
        const standardHours = 8 * 5; // 8 hours per day, 5 days
        const actualHours = workingHoursData.value.reduce((sum, day) => sum + day.hours, 0);
        return Math.max(0, actualHours - standardHours).toFixed(1);
      } else {
        const standardHours = 8 * 5 * 4; // 8 hours per day, 5 days, 4 weeks
        const actualHours = workingHoursData.value.reduce((sum, week) => sum + week.hours, 0);
        return Math.max(0, actualHours - standardHours).toFixed(1);
      }
    });
    
    const averageHours = computed(() => {
      if (selectedTimeRange.value === 'week') {
        const workingDays = workingHoursData.value.filter(day => day.hours > 0).length;
        return workingDays > 0 ? (totalHours.value / workingDays).toFixed(1) : '0.0';
      } else {
        const workingWeeks = workingHoursData.value.filter(week => week.hours > 0).length;
        return workingWeeks > 0 ? (totalHours.value / workingWeeks).toFixed(1) : '0.0';
      }
    });

    let currentChart = null;

    const createBarChart = () => {
      if (!workingHoursChart.value) return;
      
      // Destroy existing chart
      if (currentChart) {
        currentChart.destroy();
      }

      const ctx = workingHoursChart.value.getContext('2d');
      currentChart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: workingHoursData.value.map(item => item.day || item.week),
          datasets: [{
            label: 'Hours Worked',
            data: workingHoursData.value.map(item => item.hours),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(107, 114, 128, 0.3)',
              'rgba(107, 114, 128, 0.3)'
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(107, 114, 128, 0.5)',
              'rgba(107, 114, 128, 0.5)'
            ],
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
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  return context.parsed.y + ' hours';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 12,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: 'rgba(0, 0, 0, 0.7)',
                callback: function(value) {
                  return value;
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'rgba(0, 0, 0, 0.7)'
              }
            }
          }
        }
      });
    };

    const createLineChart = () => {
      if (!workingHoursChart.value) return;
      
      // Destroy existing chart
      if (currentChart) {
        currentChart.destroy();
      }

      const ctx = workingHoursChart.value.getContext('2d');
      currentChart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: lineChartData.value.map(item => item.day || item.week),
          datasets: [{
            label: 'Productivity %',
            data: lineChartData.value.map(item => item.productivity),
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(34, 197, 94, 1)',
            pointBorderColor: 'rgba(34, 197, 94, 1)',
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBorderWidth: 2
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
              callbacks: {
                label: function(context) {
                  return context.parsed.y + '%';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: 'rgba(0, 0, 0, 0.7)',
                callback: function(value) {
                  return value + '%';
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'rgba(0, 0, 0, 0.7)'
              }
            }
          }
        }
      });
    };

    const createPieChart = () => {
      if (!workingHoursChart.value) return;
      
      // Destroy existing chart
      if (currentChart) {
        currentChart.destroy();
      }

      const ctx = workingHoursChart.value.getContext('2d');
      currentChart = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: pieChartData.value.map(item => item.category),
          datasets: [{
            data: pieChartData.value.map(item => item.hours),
            backgroundColor: pieChartData.value.map(item => item.color + '80'),
            borderColor: pieChartData.value.map(item => item.color),
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'rgba(0, 0, 0, 0.7)',
                padding: 20,
                usePointStyle: true,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  return context.label + ': ' + context.parsed + 'h';
                }
              }
            }
          }
        }
      });
    };

    const createRadarChart = () => {
      if (!workingHoursChart.value) return;
      
      // Destroy existing chart
      if (currentChart) {
        currentChart.destroy();
      }

      const ctx = workingHoursChart.value.getContext('2d');
      currentChart = new ChartJS(ctx, {
        type: 'radar',
        data: radarChartData.value,
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
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': ' + context.parsed.r + '%';
                }
              }
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              min: 0,
              ticks: {
                stepSize: 25,
                color: 'rgba(0, 0, 0, 0.7)',
                font: {
                  size: 10
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              angleLines: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              pointLabels: {
                color: 'rgba(0, 0, 0, 0.7)',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            }
          }
        }
      });
    };

    const createChart = () => {
      switch (selectedChartType.value) {
        case 'line':
          createLineChart();
          break;
        case 'pie':
          createPieChart();
          break;
        case 'radar':
          createRadarChart();
          break;
        case 'bar':
        default:
          createBarChart();
          break;
      }
    };

    // Watch for chart type changes
    watch(selectedChartType, () => {
      createChart();
    });

    // Watch for time range changes
    watch(selectedTimeRange, async () => {
      await fetchData();
      createChart();
    });

    onMounted(async () => {
      await nextTick();
      createChart();
    });

    return {
      workingHoursChart,
      selectedChartType,
      selectedTimeRange,
      chartTypes,
      currentDate,
      currentTime,
      workingHoursData,
      lineChartData,
      pieChartData,
      radarChartData,
      totalHours,
      overtimeHours,
      averageHours,
      workingTimes,
      clocks,
      loading: computed(() => workingTimeLoading.value || clocksLoading.value)
    };
  }
};
</script>
