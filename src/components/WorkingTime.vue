<template>
  <div class="min-h-screen bg-white p-6 flex items-center justify-center">
    <Card class="w-full max-w-md bg-white border-gray-200 shadow-2xl"  style="background-color: white;">
      <CardHeader class="bg-white border-b border-gray-200">
        <CardTitle class="flex items-center space-x-2 text-blue-900 text-lg">
          <Timer class="h-5 w-5 text-blue-600" />
          <span>Create Working Time</span>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6 bg-white text-blue-900 p-6">
      <div class="space-y-4">
        <div>
          <Label for="date" class="text-blue-900 font-medium block mb-2">Date</Label>
          <div class="relative">
            <Input
              id="date"
              type="date"
              v-model="timeEntry.date"
              class="w-full bg-white text-blue-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
            />
            <Calendar class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
          </div>
        </div>
        <div>
          <Label for="startTime" class="text-blue-900 font-medium block mb-2">Start Time</Label>
          <div class="relative">
            <Input
              id="startTime"
              type="time"
              v-model="timeEntry.startTime"
              class="w-full bg-white text-blue-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
            />
            <Clock class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
          </div>
        </div>
        <div>
          <Label for="endTime" class="text-blue-900 font-medium block mb-2">End Time</Label>
          <div class="relative">
            <Input
              id="endTime"
              type="time"
              v-model="timeEntry.endTime"
              class="w-full bg-white text-blue-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
            />
            <Clock class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-4">
        <Button @click="cancelEntry" variant="outline" class="bg-white border-gray-300 text-blue-900 hover:bg-gray-50">
          Cancel
        </Button>
        <Button @click="saveTimeEntry" class="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
          <Save class="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { ref } from 'vue';
import Card from './ui/card.vue';
import CardContent from './ui/card-content.vue';
import CardHeader from './ui/card-header.vue';
import CardTitle from './ui/card-title.vue';
import Button from './ui/button.vue';
import Input from './ui/input.vue';
import Label from './ui/label.vue';
import { Timer, Save, Calendar, Clock } from 'lucide-vue-next';
import { useWorkingTime } from '../composables/useWorkingTime.js';

export default {
  name: 'WorkingTime',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Label,
    Timer,
    Save,
    Calendar,
    Clock
  },
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const { createWorkingTime, loading, error } = useWorkingTime();
    
    const timeEntry = ref({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00'
    });

    const cancelEntry = () => {
      // Reset form to default values
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
        
        // Reset form after successful save
        timeEntry.value = {
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00'
        };
        
        console.log('Time entry saved successfully');
        alert('Time entry saved successfully!');
      } catch (err) {
        console.error('Failed to save time entry via API:', err);
        alert(`Failed to save time entry: ${err.message}`);
        // Don't reset form on error so user can try again
      }
    };

    return {
      timeEntry,
      saveTimeEntry,
      cancelEntry,
      loading,
      error
    };
  }
};
</script>
