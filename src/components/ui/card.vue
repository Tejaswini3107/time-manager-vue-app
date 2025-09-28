<template>
  <div
    :class="cn('rounded-lg border bg-card text-card-foreground shadow-sm', $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script>
import { cn } from './utils';

export default {
  name: 'Card',
  setup() {
    return {
      cn
    };
  }
};
</script>
