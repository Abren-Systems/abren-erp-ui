import { watch, onMounted } from 'vue'

/**
 * useFormPersistence — Resilient Form Draft Infrastructure.
 *
 * Automatically syncs TanStack Form state to localStorage to prevent
 * data loss on page refresh or navigation errors.
 *
 * @param form - The TanStack Form instance.
 * @param storageKey - Unique key for this form's persistence.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormPersistence(form: any, storageKey: string) {
  /**
   * Save form values to localStorage whenever they change.
   */
  watch(
    () => form.state.values,
    (newValues) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newValues))
      } catch {
        // Silent failure for quota or security issues — non-critical for drafts
      }
    },
    { deep: true },
  )

  /**
   * Restore form values from localStorage on mount.
   */
  onMounted(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // We use setValues to rehydrate the form
        form.setValues(parsed)
      } catch {
        localStorage.removeItem(storageKey)
      }
    }
  })

  /**
   * Clear the draft (should be called on successful submission).
   */
  function clearDraft() {
    localStorage.removeItem(storageKey)
  }

  return {
    clearDraft,
  }
}
