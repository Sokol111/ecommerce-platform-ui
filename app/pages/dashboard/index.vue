<script setup lang="ts">
import type { GetTenantListResponse } from '@sokol111/ecommerce-tenant-service-api'

definePageMeta({
  layout: 'default'
})

const { user } = useAuth()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const { data: stats, pending: statsPending } = await useFetch<GetTenantListResponse>('/api/tenants', {
  query: { page: 1, size: 1 },
  server: false,
  getCachedData: () => undefined
})

const cards = computed(() => [
  {
    title: 'Total Tenants',
    value: Number(stats.value?.total ?? 0),
    icon: 'i-lucide-building-2',
    color: 'primary' as const
  },
  {
    title: 'Active Tenants',
    value: Number(stats.value?.total ?? 0),
    icon: 'i-lucide-check-circle',
    color: 'success' as const
  }
])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">
        Platform Dashboard
      </h1>
      <p class="text-muted mt-1">
        Welcome back, {{ isMounted ? (user?.email || 'Admin') : 'Admin' }}
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard
        v-for="card in cards"
        :key="card.title"
        class="relative overflow-hidden"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">
              {{ card.title }}
            </p>
            <p class="text-3xl font-bold mt-1">
              <template v-if="!isMounted">
                {{ card.value }}
              </template>
              <template v-else-if="statsPending">
                <USkeleton class="h-9 w-16" />
              </template>
              <template v-else>
                {{ card.value }}
              </template>
            </p>
          </div>
          <div
            class="h-12 w-12 rounded-xl flex items-center justify-center"
            :class="`bg-${card.color}/10`"
          >
            <UIcon
              :name="card.icon"
              class="h-6 w-6"
              :class="`text-${card.color}`"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
