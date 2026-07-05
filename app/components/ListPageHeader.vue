<script setup lang="ts">
import type { FetchError } from 'ofetch'

defineProps<{
  title: string
  total?: number
  createTo: string
  createLabel: string
  error?: FetchError | null
  errorTitle?: string
}>()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">
          {{ title }}
        </h1>
        <UBadge
          v-if="total"
          color="neutral"
          variant="subtle"
        >
          {{ total }}
        </UBadge>
      </div>
      <UButton
        :to="createTo"
        icon="i-lucide-plus"
      >
        {{ createLabel }}
      </UButton>
    </div>

    <!-- Error state -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-lucide-alert-circle"
      :title="errorTitle || `Error loading ${title.toLowerCase()}`"
      :description="error.message"
      class="mb-4"
    />
  </div>
</template>
