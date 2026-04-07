<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <UCard class="w-full max-w-lg">
    <div class="flex flex-col items-center gap-6 text-center py-4">
      <UIcon
        name="i-lucide-store"
        class="text-primary size-12"
      />
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">
          Ecommerce Platform
        </h1>
        <p class="text-muted text-base">
          Create and manage your online stores
        </p>
      </div>

      <UButton
        to="/register"
        size="lg"
        block
      >
        Create your shop
      </UButton>
    </div>
  </UCard>
</template>
