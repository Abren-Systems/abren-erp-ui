import { h } from 'vue'

export default [
  {
    path: 'inbox',
    name: 'workflows.inbox',
    component: () => import('./ui/pages/WorkflowInboxPage.vue'),
    meta: { title: 'Workflow Inbox', permissions: ['workflows:read'] },
  },
  {
    path: 'states',
    name: 'workflows.states',
    component: () =>
      Promise.resolve({
        render: () =>
          h(
            'div',
            { class: 'p-8 text-center text-neutral-500 font-medium' },
            'Workflows States (Stub)',
          ),
      }),
    meta: { title: 'Workflows States', permissions: ['workflows:read'] },
  },
]
