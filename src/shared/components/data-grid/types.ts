import type { Component } from 'vue'

export interface Action<T = unknown> {
  label: string
  onClick: (row: T) => void
  variant?: 'default' | 'destructive'
  icon?: Component
}
