import { defineAsyncComponent } from 'vue'
import { AR301000 } from './ui/AR301000/screen'

export const arScreenDefinitions = [AR301000]

export const arScreens = [
  {
    definition: AR301000,
    component: defineAsyncComponent(() => import('./ui/AR301000/view.vue')),
  },
]
