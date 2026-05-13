import { toast } from 'vue-sonner'

/**
 * useNotifications — Unified feedback hook.
 * Uses vue-sonner for toast delivery.
 */
export function useNotifications() {
  function notifySuccess(message: string) {
    toast.success(message)
  }

  function notifyError(message: string, options?: { detail?: string }) {
    toast.error(message, {
      description: options?.detail,
    })
  }

  return { notifySuccess, notifyError }
}
