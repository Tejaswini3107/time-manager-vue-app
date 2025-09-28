<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Working Times</h1>
      <Button @click="openAddModal">
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
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <p class="font-medium">{{ time.hours }}h</p>
                <p class="text-sm text-muted-foreground">Total</p>
              </div>
              <div class="flex items-center space-x-2">
                <Button variant="outline" size="sm" @click="editWorkingTime(time)">
                  <Edit class="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" @click="deleteWorkingTime(time)">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
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
                <input
                  id="date"
                  type="date"
                  v-model="timeEntry.date"
                  class="w-full text-black bg-gray-200 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <Label for="startTime" class="block mb-2 text-black">Start Time</Label>
              <div class="relative">
                <input
                  id="startTime"
                  type="time"
                  v-model="timeEntry.startTime"
                  class="w-full text-black bg-gray-200 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <Label for="endTime" class="block mb-2 text-black">End Time</Label>
              <div class="relative">
                <input
                  id="endTime"
                  type="time"
                  v-model="timeEntry.endTime"
                  class="w-full text-black bg-gray-200 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

    <!-- Edit Time Entry Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-1/2 max-w-sm border-0">
        <CardHeader>
          <CardTitle class="flex items-center space-x-2 text-black">
            <span>Edit Working Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-4">
            <div>
              <Label for="edit-date" class="block mb-2 text-black">Date</Label>
              <div class="relative">
                <input
                  id="edit-date"
                  v-model="editTimeEntry.date"
                  type="date"
                  class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="edit-start-time" class="block mb-2 text-black">Start Time</Label>
                <input
                  id="edit-start-time"
                  v-model="editTimeEntry.startTime"
                  type="time"
                  class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label for="edit-end-time" class="block mb-2 text-black">End Time</Label>
                <input
                  id="edit-end-time"
                  v-model="editTimeEntry.endTime"
                  type="time"
                  class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="closeEditModal">Cancel</Button>
            <Button @click="saveEditTimeEntry" :disabled="loading">
              <Save v-if="!loading" class="h-4 w-4 mr-2" />
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import Button from './ui/button.vue';
import Input from './ui/input.vue';
import Label from './ui/label.vue';
import { Calendar, Plus, Timer, Clock, Save, Edit, Trash2 } from 'lucide-vue-next';
import { apiService } from '../services/api.js';
import { createISODateTime } from '../utils/dateUtils.js';

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
    Save,
    Edit,
    Trash2
  },
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const workingTimes = ref([]);
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const loading = ref(false);
    const error = ref(null);
    
    const timeEntry = ref({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00'
    });

    const editTimeEntry = ref({
      id: null,
      date: '',
      startTime: '',
      endTime: ''
    });

    const loadWorkingTimes = async () => {
      try {
        const data = await apiService.getWorkingTimes(props.userId);
        
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
            start: startDate.toISOString().split('T')[1].slice(0, 5), // Extract HH:MM from UTC time
            end: endDate.toISOString().split('T')[1].slice(0, 5),   // Extract HH:MM from UTC time
            hours: Math.round((endDate - startDate) / (1000 * 60 * 60) * 100) / 100
          };
        });
      } catch (err) {
        console.error('Failed to load working times:', err);
        workingTimes.value = [];
      }
    };

    const resetForm = () => {
      timeEntry.value = {
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00'
      };
    };


    const openAddModal = () => {
      resetForm(); // Reset form when opening modal for new entry
      showAddModal.value = true;
    };

    const closeModal = () => {
      showAddModal.value = false;
      // Don't reset the form when closing - preserve user's selection
      // The form will be reset only after successful save or when opening new modal
    };


    const saveTimeEntry = async () => {
      try {
        // Validate required fields
        if (!timeEntry.value.date) {
          alert('Please select a date');
          return;
        }
        
        if (!timeEntry.value.startTime || !timeEntry.value.endTime) {
          alert('Please enter both start and end times');
          return;
        }
        
        // Validate that start time is before end time
        if (timeEntry.value.startTime >= timeEntry.value.endTime) {
          alert('Start time must be before end time');
          return;
        }
        
        // Combine date and time to create ISO datetime strings
        const startDateTime = createISODateTime(timeEntry.value.date, timeEntry.value.startTime);
        const endDateTime = createISODateTime(timeEntry.value.date, timeEntry.value.endTime);
        
        // Additional validation: check if start is before end after conversion
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);
        
        if (startDate >= endDate) {
          alert('Start time must be before end time');
          return;
        }
        
        const workingTimeData = {
          user_id: props.userId,
          start: startDateTime,
          end: endDateTime
        };

        console.log('Creating working time with data:', workingTimeData);
        await apiService.createWorkingTime(workingTimeData);
        
        // Close modal and reload data
        closeModal();
        resetForm(); // Reset form after successful save
        await loadWorkingTimes();
        
        alert('Time entry saved successfully!');
      } catch (err) {
        console.error('Failed to save time entry via API:', err);
        alert(`Failed to save time entry: ${err.message}`);
      }
    };

    const editWorkingTime = (time) => {
      // The time object already has the processed format with date, start, end as display strings
      // We can use these directly since they're already in the correct format
      editTimeEntry.value = {
        id: time.id,
        date: time.date,        // Already in YYYY-MM-DD format
        startTime: time.start,  // Already in HH:MM format
        endTime: time.end       // Already in HH:MM format
      };
      
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editTimeEntry.value = {
        id: null,
        date: '',
        startTime: '',
        endTime: ''
      };
      error.value = null;
    };

    const saveEditTimeEntry = async () => {
      try {
        loading.value = true;
        error.value = null;

        // Validate that start time is before end time
        if (editTimeEntry.value.startTime >= editTimeEntry.value.endTime) {
          error.value = 'Start time must be before end time';
          loading.value = false;
          return;
        }

        const startDateTime = createISODateTime(editTimeEntry.value.date, editTimeEntry.value.startTime);
        const endDateTime = createISODateTime(editTimeEntry.value.date, editTimeEntry.value.endTime);
        
        // Additional validation: check if start is before end after conversion
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);
        
        if (startDate >= endDate) {
          error.value = 'Start time must be before end time';
          loading.value = false;
          return;
        }
        
        const workingTimeData = {
          user_id: props.userId,
          start: startDateTime,
          end: endDateTime
        };

        console.log('Updating working time with data:', workingTimeData);
        await apiService.updateWorkingTime(editTimeEntry.value.id, workingTimeData);
        
        // Close modal and reload data
        closeEditModal();
        await loadWorkingTimes();
        
        alert('Time entry updated successfully!');
      } catch (err) {
        console.error('Failed to update time entry:', err);
        error.value = err.message || 'Failed to update time entry. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const deleteWorkingTime = async (time) => {
      if (confirm(`Are you sure you want to delete this time entry? This action cannot be undone.`)) {
        try {
          loading.value = true;
          await apiService.deleteWorkingTime(time.id);
          await loadWorkingTimes();
          alert('Time entry deleted successfully!');
        } catch (err) {
          console.error('Failed to delete time entry:', err);
          alert(`Failed to delete time entry: ${err.message}`);
        } finally {
          loading.value = false;
        }
      }
    };



    onMounted(() => {
      loadWorkingTimes();
    });

    return {
      workingTimes,
      showAddModal,
      showEditModal,
      timeEntry,
      editTimeEntry,
      loading,
      error,
      openAddModal,
      closeModal,
      saveTimeEntry,
      editWorkingTime,
      closeEditModal,
      saveEditTimeEntry,
      deleteWorkingTime
    };
  }
};
</script>
