import { defineAsyncComponent } from 'vue'
import { AR301000 } from './ui/AR301000/definition'

export const arScreenDefinitions = [AR301000]

export const arScreens = [
  {
    definition: AR301000,
    component: defineAsyncComponent(() => import('./ui/AR301000/AR301000.vue')),
  },
]
