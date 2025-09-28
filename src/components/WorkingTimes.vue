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
      type: String,
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
        const data = await fetchWorkingTimes();
        workingTimes.value = data.map(entry => ({
          id: entry.id,
          date: new Date(entry.start).toISOString().split('T')[0],
          start: new Date(entry.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          end: new Date(entry.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hours: Math.round((new Date(entry.end) - new Date(entry.start)) / (1000 * 60 * 60) * 100) / 100
        }));
      } catch (err) {
        console.error('Failed to load working times:', err);
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
        // Combine date and time to create ISO datetime strings
        const startDateTime = new Date(`${timeEntry.value.date}T${timeEntry.value.startTime}`).toISOString();
        const endDateTime = new Date(`${timeEntry.value.date}T${timeEntry.value.endTime}`).toISOString();
        
        const workingTimeData = {
          start: startDateTime,
          end: endDateTime
        };

        await createWorkingTime(props.userId, workingTimeData);
        
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
