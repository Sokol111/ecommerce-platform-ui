<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  auth: false
})

const { login } = useAuth()
const route = useRoute()

const errorMessage = computed(() => {
  if (route.query.error === 'platform_access_required') return 'Your account does not have access to this platform admin panel.'
  if (route.query.error === 'oidc_auth_failed') return 'Sign in failed. Please try again.'
  return null
})
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

    <UAlert
      v-if="errorMessage"
      class="mb-4"
      color="error"
      icon="i-lucide-circle-alert"
      :description="errorMessage"
    />

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
