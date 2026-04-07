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

  return { success, error }
}
