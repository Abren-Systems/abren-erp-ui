import { h } from 'vue'

export default [
  {
    path: 'inbox',
    name: 'WorkflowInbox',
    component: () => import('./ui/pages/WorkflowInboxPage.vue'),
  },
  {
    path: 'states',
    name: 'WorkflowsStates',
    component: () =>
      Promise.resolve({
        render: () =>
          h(
            'div',
            { class: 'p-8 text-center text-neutral-500 font-medium' },
            'Workflows States (Stub)',
          ),
      }),
  },
]
