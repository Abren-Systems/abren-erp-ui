<script setup lang="ts">
import { computed, provide, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { screenRegistry } from './screen-registry'
import { AppSidePanel, PageHeader } from '@/shared/components/workspace'
import { AppButton } from '@/shared/components/primitives'
import FormTitleBar from '@/platform/chrome/FormTitleBar.vue'
import FormToolbar from '@/platform/chrome/FormToolbar.vue'
import FormBanner from '@/platform/chrome/FormBanner.vue'
import type { ScreenDefinition } from './screen-definition.types'
import type { ScreenId } from './screen-id.types'
import { ScreenControllerKey } from './injection-keys'
import type { ScreenContext, ScreenController } from './screen-controller.types'

const props = defineProps<{
  id?: string // E.g., 'new', or UUID from router params
}>()

const route = useRoute()

// Resolve the screen definition from the router meta
const screenId = computed(() => route.meta.screenId as string)
const screen = computed(
  () => screenRegistry.get(screenId.value as ScreenId) as ScreenDefinition | undefined,
)

// Platform-Owned Controller Lifecycle
const controllerRef = shallowRef<ScreenController<unknown, string> | null>(null)

watch(
  () => [screen.value?.id, route.params, route.query],
  () => {
    if (screen.value?.controller) {
      const ctx: ScreenContext = {
        params: route.params,
        query: route.query,
      }
      controllerRef.value = screen.value.controller(ctx)
    } else {
      controllerRef.value = null
    }
  },
  { immediate: true, deep: true },
)

provide(ScreenControllerKey, controllerRef)

// Resolve the Working Area view component (currently from renderTarget,
// eventually this will resolve dynamically from views contract)
const WorkingArea = computed(() => {
  if (!screen.value?.layout.renderTarget) return null
  return screen.value.layout.renderTarget
})

// Extract the side panel contract if defined
const sidePanelContract = computed(() => {
  return screen.value?.layout?.sidePanel
})
</script>

<template>
  <div v-if="screen" class="flex w-full h-full relative overflow-hidden bg-[var(--app-canvas)]">
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
      <!-- Platform Chrome controlled by ScreenKind -->
      <template v-if="controllerRef.value">
        <!-- Inquiry & Lists get the generic PageHeader -->
        <PageHeader
          v-if="['inquiry', 'primaryList', 'dashboard'].includes(screen.kind)"
          :title="screen.titleKey"
        >
          <template #actions>
            <AppButton
              v-for="cmd in screen.commands?.filter((c) => c.displayOnMainToolbar)"
              :key="cmd.key"
              :variant="cmd.variant === 'primary' ? 'primary' : 'outline'"
              size="sm"
              @click="controllerRef.value.commands.value[cmd.key]?.execute()"
            >
              {{ cmd.labelKey }}
            </AppButton>
          </template>
        </PageHeader>
        <!-- Data Entry & Master Data get the dense Form Toolbar -->
        <template
          v-else-if="['dataEntry', 'maintenance', 'setup', 'processing'].includes(screen.kind)"
        >
          <FormTitleBar :title="screen.titleKey" />
          <FormToolbar
            :projection="controllerRef.value.projection.value"
            :executors="controllerRef.value.commands.value"
            :is-pending="controllerRef.value.isPending?.value ?? false"
            :is-new="controllerRef.value.isNew?.value ?? false"
            :is-editable="controllerRef.value.interpretedState.value.editable"
          />
          <FormBanner
            v-if="controllerRef.value.interpretedState.value.banner"
            :banner="controllerRef.value.interpretedState.value.banner"
          />
        </template>
      </template>

      <!-- Pure Working Area -->
      <KeepAlive :max="10">
        <component
          :is="WorkingArea"
          v-if="WorkingArea"
          :key="screen.id + ':' + (props.id || 'new')"
          :id="props.id"
        />
      </KeepAlive>

      <div v-if="!WorkingArea" class="flex items-center justify-center h-full text-neutral-400">
        No working area defined for {{ screen.id }}
      </div>
    </div>

    <!-- Platform Side Panel -->
    <AppSidePanel v-if="sidePanelContract" :contract="sidePanelContract" />
  </div>
  <div v-else class="flex items-center justify-center h-full text-danger-500 font-medium">
    Screen Definition Not Found: {{ screenId }}
  </div>
</template>
