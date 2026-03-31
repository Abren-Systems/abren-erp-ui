<script setup lang="ts">
const users = [
  { id: 1, email: 'admin@abren.com', role: 'Super Admin', status: 'Active' },
  { id: 2, email: 'finance@abren.com', role: 'Finance Manager', status: 'Active' },
]
</script>

<template>
  <div class="p-6 space-y-6">
    <header>
      <h1 class="text-2xl font-bold tracking-tight">Users</h1>
      <p class="text-sm text-neutral-500">
        Manage user accounts and permissions within your tenant.
      </p>
    </header>

    <div class="rounded-lg border border-neutral-200 bg-white">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-neutral-50/50 text-left">
            <th class="p-4 font-medium italic">Email</th>
            <th class="p-4 font-medium italic">Role</th>
            <th class="p-4 font-medium italic">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="border-b last:border-0 hover:bg-neutral-50/50"
          >
            <td class="p-4">{{ user.email }}</td>
            <td class="p-4">{{ user.role }}</td>
            <td class="p-4">
              <span
                class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                {{ user.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="p-8 text-center text-neutral-400 border-2 border-dashed rounded-xl">
      <p>Fine-grained User & RBAC Management (Coming Soon)</p>
    </div>
  </div>
</template>
