/**
 * Query Key Factory for Workflows Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
export const workflowKeys = {
  all: ['workflows'] as const,
  pendingTasks: () => [...workflowKeys.all, 'pending-tasks'] as const,
}
