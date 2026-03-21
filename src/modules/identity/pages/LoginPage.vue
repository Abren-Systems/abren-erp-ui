<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/auth/auth.store'
import { Button } from '@/core/ui/button'
import { Input } from '@/core/ui/input'
import { Label } from '@/core/ui/label'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  try {
    // Mock authentication successful with dev bypass
    authStore.setAuth(
      'dev-token',
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: email.value || 'test@example.com',
        full_name: 'Test User',
        role: 'admin'
      },
      {
        id: '754b3739-4526-4441-979f-fc0aab15b8d9',
        name: 'Default Tenant',
        features: { 'accounting': true }
      }
    )
    
    await new Promise(resolve => setTimeout(resolve, 800))
    router.push('/app')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md space-y-8 rounded-2xl border border-neutral-200 bg-white p-10 shadow-xl">
    <div class="text-center">
      <h2 class="text-4xl font-bold tracking-tight text-neutral-900">
        Abren ERP
      </h2>
      <p class="mt-3 text-sm text-neutral-500 font-medium">
        Sign in to your financial operating system
      </p>
    </div>

    <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <div class="space-y-5">
        <div class="space-y-2">
          <Label for="email" class="text-neutral-700 font-semibold">Email address</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="name@company.com"
            class="h-12"
          />
        </div>
        <div class="space-y-2">
          <Label for="password" class="text-neutral-700 font-semibold">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="h-12"
          />
        </div>
      </div>

      <div class="flex items-center justify-between px-0.5">
        <div class="flex items-center gap-2">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            class="h-4.5 w-4.5 rounded-md border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          >
          <label for="remember-me" class="text-sm text-neutral-600 cursor-pointer select-none">
            Remember me
          </label>
        </div>

        <div class="text-sm">
          <a href="#" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Forgot password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        class="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        :disabled="isLoading"
      >
        <template v-if="isLoading">
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
            Signing in...
          </div>
        </template>
        <template v-else>
          Sign in
        </template>
      </Button>
    </form>
  </div>
</template>
