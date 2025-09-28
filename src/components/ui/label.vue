<template>
  <label
    :class="cn(
      'text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </label>
</template>

<script>
import { cn } from './utils';

export default {
  name: 'Label',
  setup() {
    return {
      cn
    };
  }
};
</script>
