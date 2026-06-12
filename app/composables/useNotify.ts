export interface ApiErrorData {
  title?: string
  detail?: string
}

export function useNotify() {
  const toast = useToast()

  function success(message: string, title = 'Success') {
    toast.add({
      title,
      description: message,
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }

  function error(message: string, title = 'Error') {
    toast.add({
      title,
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }

  function warning(message: string, title = 'Warning') {
    toast.add({
      title,
      description: message,
      color: 'warning',
      icon: 'i-lucide-alert-triangle'
    })
  }

  function info(message: string, title = 'Info') {
    toast.add({
      title,
      description: message,
      color: 'info',
      icon: 'i-lucide-info'
    })
  }

  /**
   * Handle API error response with fallback message
   */
  function apiError(errData: ApiErrorData | null | undefined, fallbackMessage: string) {
    error(errData?.detail || fallbackMessage, errData?.title || 'Error')
  }

  /**
   * Common CRUD success messages
   */
  const crud = {
    created: (entity: string) => success(`${entity} created successfully`),
    updated: (entity: string) => success(`${entity} updated successfully`),
    deleted: (entity: string) => success(`${entity} deleted successfully`),
    createFailed: (entity: string, errData?: ApiErrorData | null) =>
      apiError(errData, `Failed to create ${entity.toLowerCase()}`),
    updateFailed: (entity: string, errData?: ApiErrorData | null) =>
      apiError(errData, `Failed to update ${entity.toLowerCase()}`),
    deleteFailed: (entity: string, errData?: ApiErrorData | null) =>
      apiError(errData, `Failed to delete ${entity.toLowerCase()}`)
  }

  return {
    success,
    error,
    warning,
    info,
    apiError,
    crud
  }
}
