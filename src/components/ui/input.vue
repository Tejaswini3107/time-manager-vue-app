<template>
  <input
    :class="cn(
      'flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      $attrs.class
    )"
    :style="{
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
      color: '#1e3a8a',
      '--tw-placeholder-color': '#6b7280'
    }"
    v-bind="$attrs"
  />
</template>

<script>
import { cn } from './utils';

export default {
  name: 'Input',
  setup() {
    return {
      cn
    };
  }
};
</script>
