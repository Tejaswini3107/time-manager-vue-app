<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Working Times</h1>
      <Button @click="showAddModal = true">
        <Plus class="h-4 w-4 mr-2" />
        Add Time Entry
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <Calendar class="h-5 w-5" />
          <span>Time Entries</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-for="time in workingTimes" :key="time.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p class="font-medium">{{ time.date }}</p>
              <p class="text-sm text-muted-foreground">
                {{ time.start }} - {{ time.end }}
              </p>
            </div>
            <div class="text-right">
              <p class="font-medium">{{ time.hours }}h</p>
              <p class="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Add Time Entry Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-1/2 max-w-sm border-0">
        <CardHeader>
          <CardTitle class="flex items-center space-x-2 text-black">
            <span>Create Working Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-4">
            <div>
              <Label for="date" class="block mb-2 text-black">Date</Label>
              <div class="relative">
                <Input
                  id="date"
                  type="date"
                  v-model="timeEntry.date"
                  class="w-full text-black bg-gray-200"
                />
              </div>
            </div>
            <div>
              <Label for="startTime" class="block mb-2 text-black">Start Time</Label>
              <div class="relative">
                <Input
                  id="startTime"
                  type="time"
                  v-model="timeEntry.startTime"
                  class="w-full text-black bg-gray-200"
                />
              </div>
            </div>
            <div>
              <Label for="endTime" class="block mb-2 text-black">End Time</Label>
              <div class="relative">
                <Input
                  id="endTime"
                  type="time"
                  v-model="timeEntry.endTime"
                  class="w-full text-black bg-gray-200"
                />
              </div>
            </div>
          </div>

          <div class="flex space-x-2">
            <Button @click="closeModal" variant="outline" class="flex-1">
              Cancel
            </Button>
            <Button @click="saveTimeEntry" :disabled="loading" class="flex-1">
              <Save class="h-4 w-4 mr-2" />
              <span v-if="loading">Creating...</span>
              <span v-else>Create</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import Button from './ui/button.vue';
import Input from './ui/input.vue';
import Label from './ui/label.vue';
import { Calendar, Plus, Timer, Clock, Save } from 'lucide-vue-next';
import { useWorkingTime } from '../composables/useWorkingTime.js';

export default {
  name: 'WorkingTimes',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Label,
    Calendar,
    Plus,
    Timer,
    Clock,
    Save
  },
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const { fetchWorkingTimes, createWorkingTime, loading, error } = useWorkingTime();
    const workingTimes = ref([]);
    const showAddModal = ref(false);
    
    const timeEntry = ref({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00'
    });

    const loadWorkingTimes = async () => {
      try {
        console.log('=== LOADING WORKING TIMES ===');
        console.log('User ID:', props.userId);
        console.log('Calling fetchWorkingTimes...');
        
        const data = await fetchWorkingTimes(props.userId);
        console.log('Raw API data:', data);
        console.log('Data type:', typeof data);
        console.log('Data length:', data ? data.length : 'null/undefined');
        
        workingTimes.value = data.map(entry => {
          // Validate dates before processing
          const startDate = new Date(entry.start);
          const endDate = new Date(entry.end);
          
          // Check if dates are valid
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn('Invalid date found in entry:', entry);
            return {
              id: entry.id,
              date: 'Invalid Date',
              start: 'Invalid Time',
              end: 'Invalid Time',
              hours: 0
            };
          }
          
          return {
            id: entry.id,
            date: startDate.toISOString().split('T')[0],
            start: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            end: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hours: Math.round((endDate - startDate) / (1000 * 60 * 60) * 100) / 100
          };
        });
      } catch (err) {
        console.error('=== FAILED TO LOAD WORKING TIMES ===');
        console.error('Error:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        workingTimes.value = [];
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      // Reset form
      timeEntry.value = {
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00'
      };
    };

    const saveTimeEntry = async () => {
      try {
        console.log('=== SAVING TIME ENTRY ===');
        console.log('User ID:', props.userId);
        console.log('Time Entry:', timeEntry.value);
        
        // Combine date and time to create ISO datetime strings
        const startDateTime = new Date(`${timeEntry.value.date}T${timeEntry.value.startTime}`).toISOString();
        const endDateTime = new Date(`${timeEntry.value.date}T${timeEntry.value.endTime}`).toISOString();
        
        console.log('Start DateTime:', startDateTime);
        console.log('End DateTime:', endDateTime);
        
        const workingTimeData = {
          start: startDateTime,
          end: endDateTime
        };

        console.log('Working Time Data:', workingTimeData);
        console.log('Calling createWorkingTime...');
        
        const result = await createWorkingTime(props.userId, workingTimeData);
        console.log('Create result:', result);
        
        // Close modal and reload data
        closeModal();
        await loadWorkingTimes();
        
        console.log('Time entry saved successfully');
        alert('Time entry saved successfully!');
      } catch (err) {
        console.error('Failed to save time entry via API:', err);
        alert(`Failed to save time entry: ${err.message}`);
      }
    };

    onMounted(() => {
      loadWorkingTimes();
    });

    return {
      workingTimes,
      showAddModal,
      timeEntry,
      loading,
      error,
      closeModal,
      saveTimeEntry
    };
  }
};
</script>
