<script setup lang="ts">
import type { Tenant } from '@sokol111/ecommerce-tenant-service-api'

definePageMeta({
  layout: 'default'
})

const {
  items: tenants,
  total,
  pending,
  error,
  page,
  size,
  totalPages,
  handlePageChange,
  refresh
} = await useListPage<Tenant>('/api/tenants')

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'enabled', header: 'Status' },
  { accessorKey: 'createdAt', header: 'Created' },
  { id: 'actions', header: '' }
]

// Breadcrumbs
const breadcrumbs = [
  { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: 'Tenants' }
]

// Delete state
const deleteTarget = ref<{ slug: string, name: string } | null>(null)
const deleteLoading = ref(false)
const isDeleteModalOpen = ref(false)

function openDelete(row: Tenant) {
  deleteTarget.value = { slug: row.slug, name: row.name }
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return

  const notify = useNotify()
  deleteLoading.value = true

  try {
    const result = await $fetch<{ success: boolean, error?: { title?: string, detail?: string } }>(
      `/api/tenants/${target.slug}`,
      { method: 'DELETE' }
    )

    if (result.success) {
      notify.crud.deleted(target.name)
      deleteTarget.value = null
      isDeleteModalOpen.value = false
      await refresh()
    } else {
      notify.crud.deleteFailed(target.name, result.error)
    }
  } catch {
    notify.crud.deleteFailed(target.name)
  } finally {
    deleteLoading.value = false
  }
}

function cancelDelete() {
  deleteTarget.value = null
  isDeleteModalOpen.value = false
}

function formatDate(value: { seconds: bigint | number } | string | null | undefined) {
  if (!value) return '-'
  const isoStr = typeof value === 'string' ? value : new Date(Number(value.seconds) * 1000).toISOString()
  return new Date(isoStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div>
    <!-- Breadcrumbs + Title (admin-ui pattern) -->
    <div class="mb-6">
      <Breadcrumbs
        :items="breadcrumbs"
      />
      <div class="flex items-center justify-between mt-4">
        <h1 class="text-2xl font-bold">
          Tenants
        </h1>
        <UButton icon="i-lucide-plus">
          Create Tenant
        </UButton>
      </div>
    </div>

    <UCard>
      <TableSkeleton
        v-if="pending && !tenants.length"
        :columns="columns.length"
      />

      <div
        v-else
        :class="{ 'opacity-50': pending }"
      >
        <UAlert
          v-if="error"
          color="error"
          icon="i-lucide-alert-circle"
          title="Error loading tenants"
          :description="error.message"
          class="mb-4"
        />

        <UTable
          :data="tenants"
          :columns="columns"
        >
          <template #enabled-cell="{ row }">
            <StatusBadge :enabled="row.original.enabled" />
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-sm text-muted">
              {{ formatDate(row.original.createdAt) }}
            </span>
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu
              :items="[
                [
                  {
                    label: 'Delete',
                    icon: 'i-lucide-trash-2',
                    onSelect: () => openDelete(row.original)
                  }
                ]
              ]"
            >
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-more-horizontal"
                size="sm"
              />
            </UDropdownMenu>
          </template>
        </UTable>
      </div>
    </UCard>

    <!-- Empty state -->
    <div
      v-if="!pending && !tenants.length"
      class="text-center py-12"
    >
      <UIcon
        name="i-lucide-building-2"
        class="h-12 w-12 text-muted mx-auto mb-4"
      />
      <p class="text-muted">
        No tenants found.
      </p>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="mt-4 flex justify-center"
    >
      <UPagination
        :default-page="page"
        :total="total"
        :items-per-page="size"
        @update:page="handlePageChange"
      />
    </div>

    <!-- Delete confirmation modal -->
    <UModal
      v-model:open="isDeleteModalOpen"
      @update:open="(open) => { if (!open) cancelDelete() }"
    >
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Delete Tenant
            </h2>
          </template>

          <p>
            Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong>?
            This action cannot be undone.
          </p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                variant="ghost"
                color="neutral"
                @click="cancelDelete"
              >
                Cancel
              </UButton>
              <UButton
                color="error"
                :loading="deleteLoading"
                @click="confirmDelete"
              >
                Delete
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
