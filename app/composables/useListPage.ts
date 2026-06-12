import type { LocationQueryRaw } from 'vue-router'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
}

export interface UseListPageOptions {
  defaultSize?: number
}

export async function useListPage<T>(endpoint: string, options: UseListPageOptions = {}) {
  const { defaultSize = 10 } = options
  const route = useRoute()

  // Query params
  const page = computed(() => Number(route.query.page) || 1)
  const size = computed(() => Number(route.query.size) || defaultSize)

  // Fetch data
  const { data, pending, error, refresh } = await useFetch<PaginatedResponse<T>>(endpoint, {
    query: {
      page,
      size
    },
    getCachedData: () => undefined,
    server: false
  })

  // Computed
  const items = computed(() => data.value?.items || [])
  const total = computed(() => data.value?.total || 0)
  const totalPages = computed(() => Math.ceil(total.value / size.value))

  // Navigation
  function handlePageChange(newPage: number) {
    navigateTo({
      query: {
        ...route.query,
        page: newPage
      } as LocationQueryRaw
    })
  }

  // Row actions helper
  function createRowActions<R extends { id: string, name?: string }>(row: R, basePath: string, options?: { deleteEndpoint?: string }) {
    const actions = [
      [
        {
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect: () => navigateTo(`${basePath}/${row.id}/edit`)
        }
      ]
    ]

    if (options?.deleteEndpoint) {
      actions.push([
        {
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          onSelect: () => {
            deleteTarget.value = { id: row.id, name: row.name, endpoint: options.deleteEndpoint! }
          }
        }
      ])
    }

    return actions
  }

  // Delete
  const deleteTarget = ref<{ id: string, name?: string, endpoint: string } | null>(null)
  const deleteLoading = ref(false)

  async function confirmDelete() {
    const target = deleteTarget.value
    if (!target) return

    const notify = useNotify()
    deleteLoading.value = true

    try {
      const result = await $fetch<{ success: boolean, error?: { title?: string, detail?: string } }>(
        `${target.endpoint}/${target.id}`,
        { method: 'DELETE' }
      )

      if (result.success) {
        notify.crud.deleted(target.name || 'Item')
        deleteTarget.value = null
        await refresh()
      } else {
        notify.crud.deleteFailed(target.name || 'Item', result.error)
      }
    } catch {
      notify.crud.deleteFailed(target.name || 'Item')
    } finally {
      deleteLoading.value = false
    }
  }

  function cancelDelete() {
    deleteTarget.value = null
  }

  return {
    // Data
    data,
    items,
    total,
    pending,
    error,
    refresh,

    // Pagination
    page,
    size,
    totalPages,
    handlePageChange,

    // Helpers
    createRowActions,

    // Delete
    deleteTarget,
    deleteLoading,
    confirmDelete,
    cancelDelete
  }
}
