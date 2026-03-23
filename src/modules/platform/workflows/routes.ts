import { h } from 'vue'

export default [
  {
    path: 'states',
    name: 'WorkflowsStates',
    component: () => Promise.resolve({ render: () => h('div', 'Workflows States (Stub)') }),
  },
]
