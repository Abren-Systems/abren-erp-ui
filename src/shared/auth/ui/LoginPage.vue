<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/auth/auth.store'
import { AppButton, AppInput, AppLabel } from '@/shared/components/primitives'
import { Lock, Mail, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(email.value, password.value)
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/app')
        ? route.query.redirect
        : '/app'
    await router.push(redirect)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to sign in with the supplied credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    class="w-full max-w-md space-y-8 rounded-sm border border-[var(--color-neutral-200)] bg-white p-10 shadow-xl"
  >
    <div class="text-center">
      <div class="inline-flex p-3 rounded-sm bg-[var(--color-primary-50)] mb-6">
        <ShieldCheck class="h-10 w-10 text-[var(--color-primary-600)]" />
      </div>
      <h2 class="text-3xl font-bold tracking-tight text-[var(--color-neutral-900)]">Abren ERP</h2>
      <p class="mt-2 text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-400)]">
        Autonomous Financial Engine
      </p>
    </div>

    <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <div class="space-y-4">
        <div class="space-y-1.5">
          <AppLabel for="email">Email address</AppLabel>
          <AppInput
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="name@company.com"
            class="h-11"
          />
        </div>
        <div class="space-y-1.5">
          <AppLabel for="password">Password</AppLabel>
          <AppInput
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="h-11"
          />
        </div>
      </div>

      <p
        v-if="errorMessage"
        class="rounded-sm border border-[var(--color-danger-200)] bg-[var(--color-danger-50)] px-3 py-2.5 text-xs font-medium text-[var(--color-danger-700)]"
      >
        {{ errorMessage }}
      </p>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            class="h-4 w-4 rounded-sm border-[var(--color-neutral-300)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] cursor-pointer"
          />
          <AppLabel
            for="remember-me"
            class="text-xs font-medium text-[var(--color-neutral-600)] cursor-pointer select-none tracking-normal normal-case"
          >
            Keep me authenticated
          </AppLabel>
        </div>

        <div class="text-xs">
          <a
            href="#"
            class="font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
          >
            Forgot access?
          </a>
        </div>
      </div>

      <AppButton
        type="submit"
        variant="primary"
        class="w-full h-11 text-sm font-bold shadow-sm"
        :disabled="isLoading"
      >
        <template v-if="isLoading"> Signing in... </template>
        <template v-else> Authenticate </template>
      </AppButton>
    </form>
  </div>
</template>
