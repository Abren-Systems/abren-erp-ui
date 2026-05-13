/**
 * useDialogs — Unified dialog hook.
 * Currently uses browser native dialogs, to be replaced by custom
 * headless-ui/reka-ui components later.
 */
export function useDialogs() {
  async function confirm(options: {
    title: string
    message: string
    variant?: 'primary' | 'danger'
  }): Promise<boolean> {
    // Native browser confirm is blocking, but we wrap in async for future-proofing
    return window.confirm(`${options.title}\n\n${options.message}`)
  }

  async function prompt(options: {
    title: string
    message: string
    required?: boolean
  }): Promise<string | null> {
    const result = window.prompt(`${options.title}\n\n${options.message}`)
    if (options.required && !result) {
      return null
    }
    return result
  }

  return { confirm, prompt }
}
