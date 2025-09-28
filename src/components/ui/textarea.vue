<template>
  <textarea
    :class="cn(
      'flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      $attrs.class
    )"
    :style="{
      backgroundColor: '#1f2937',
      borderColor: '#4b5563',
      color: '#ffffff',
      '--tw-placeholder-color': '#9ca3af'
    }"
    v-bind="$attrs"
  />
</template>

<script>
import { cn } from './utils';

export default {
  name: 'Textarea',
  setup() {
    return {
      cn
    };
  }
};
</script>
