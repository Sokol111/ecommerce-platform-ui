<script setup lang="ts">
withDefaults(defineProps<{
  columns?: number
  rows?: number
}>(), {
  columns: 5,
  rows: 5
})
</script>

<template>
  <div class="w-full">
    <!-- Header row -->
    <div class="flex gap-4 p-4 border-b border-default">
      <USkeleton
        v-for="col in columns"
        :key="`header-${col}`"
        class="h-4 flex-1"
      />
    </div>

    <!-- Data rows -->
    <div
      v-for="row in rows"
      :key="`row-${row}`"
      class="flex gap-4 p-4 border-b border-default last:border-b-0"
    >
      <USkeleton
        v-for="col in columns"
        :key="`cell-${row}-${col}`"
        class="h-4 flex-1"
      />
    </div>
  </div>
</template>
