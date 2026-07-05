<script setup lang="ts">
import type { BreadcrumbItem } from './Breadcrumbs.vue'

defineProps<{
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
}>()
</script>

<template>
  <div class="mb-6">
    <Breadcrumbs
      v-if="breadcrumbs?.length"
      :items="breadcrumbs"
    />
    <h1 class="text-2xl font-bold">
      {{ title }}
    </h1>
    <p
      v-if="description"
      class="text-muted mt-1"
    >
      {{ description }}
    </p>
  </div>
</template>
