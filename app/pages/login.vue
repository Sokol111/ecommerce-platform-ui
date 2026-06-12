<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  auth: false
})

const { login } = useAuth()
</script>

<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <div class="text-center">
        <h1 class="text-2xl font-bold">
          Sign in
        </h1>
        <p class="text-muted mt-1">
          Sign in to access the platform admin panel
        </p>
      </div>
    </template>

    <UButton
      block
      size="lg"
      icon="i-lucide-log-in"
      @click="login()"
    >
      Sign in
    </UButton>
  </UCard>
</template>
