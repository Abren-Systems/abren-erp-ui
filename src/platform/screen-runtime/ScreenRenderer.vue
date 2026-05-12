<script setup lang="ts">
import {
  computed,
  provide,
  shallowRef,
  watch,
  effectScope,
  getCurrentInstance,
  onScopeDispose,
  defineComponent,
  defineAsyncComponent,
} from 'vue'
import type { EffectScope, PropType } from 'vue'
import { useRoute } from 'vue-router'
import { screenRegistry } from './screen-registry'
import AppSidePane from '@/shared/components/AppSidePane.vue'
import { AppButton } from '@/shared/components/primitives'
import ListTitleBar from '@/platform/chrome/ListTitleBar.vue'
import FormTitleBar from '@/platform/chrome/FormTitleBar.vue'
import FormToolbar from '@/platform/chrome/FormToolbar.vue'
import FormBanner from '@/platform/chrome/FormBanner.vue'
import ConfirmDialog from '@/platform/chrome/ConfirmDialog.vue'
import { AuditReasonDialog } from '@/shared/components/dialog'
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

// The ControllerHost is a renderless component that exists solely to provide
// a "legit" setup() context for the screen controller. This allows the controller
// to safely use inject() (required by useQuery, useRouter, etc.) without
// injection context violations.
const ControllerHost = defineComponent({
  name: 'ControllerHost',
  props: {
    screen: {
      type: Object as PropType<ScreenDefinition>,
      required: true,
    },
    ctx: {
      type: Object as PropType<ScreenContext>,
      required: true,
    },
  },
  emits: {
    ready: (controller: ScreenController<unknown, string>) => true,
  },
  setup(props, { emit }) {
    const scope = effectScope()
    let controller: ScreenController<unknown, string> | null = null

    scope.run(() => {
      // Now we are inside a real setup() of a mounted component!
      controller = props.screen.controller(props.ctx)
    })

    if (controller) {
      emit('ready', controller)
    }

    onScopeDispose(() => {
      scope.stop()
    })

    return () => null // Renderless
  },
})

const screenCtx = computed<ScreenContext>(() => ({
  params: route.params,
  query: route.query,
}))

provide(ScreenControllerKey, controllerRef)

// Resolve the Working Area view component (currently from renderTarget,
// eventually this will resolve dynamically from views contract)
const WorkingArea = computed(() => {
  if (!screen.value?.layout.renderTarget) return null
  const target = screen.value.layout.renderTarget
  // If it's a function (dynamic import), wrap it
  if (typeof target === 'function') {
    return defineAsyncComponent(target as () => Promise<import('vue').Component>)
  }
  return target
})

// Extract the side panel contract if defined
const sidePanelContract = computed(() => {
  return screen.value?.layout?.sidePanel
})
</script>

<template>
  <div v-if="screen" class="flex w-full h-full relative overflow-hidden bg-[var(--app-canvas)]">
    <!-- 
      Host component that initializes the controller in a proper setup() context.
      Changing the key ensures the old controller is stopped and a new one is started
      whenever we navigate between different screens or records.
    -->
    <ControllerHost
      v-if="screen.controller"
      :key="route.fullPath"
      :screen="screen"
      :ctx="screenCtx"
      @ready="(c) => (controllerRef = c)"
    />

    <div class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
      <!-- Loading State (Before Controller Resolves) -->
      <div v-if="!controllerRef" class="flex-1 p-8 text-[var(--color-neutral-500)]">Loading...</div>

      <!-- Error State (From Controller) -->
      <div v-else-if="controllerRef.error.value" class="flex-1 p-8 text-[var(--color-danger-600)]">
        <h2 class="text-lg font-bold">Error</h2>
        <p>{{ controllerRef.error.value }}</p>
      </div>

      <!-- Loading State (From Controller) -->
      <div
        v-else-if="
          controllerRef.isLoading.value && !controllerRef.entity.value && !controllerRef.isNew.value
        "
        class="flex-1 p-8 text-[var(--color-neutral-500)]"
      >
        Loading data...
      </div>

      <!-- Platform Chrome controlled by ScreenKind -->
      <template v-else>
        <!-- Inquiry & Lists get ListTitleBar -->
        <ListTitleBar
          v-if="['inquiry', 'primaryList', 'dashboard'].includes(screen.kind)"
          :screen-title="screen.titleKey"
        >
          <template #actions>
            <AppButton
              v-for="cmd in screen.commands?.filter((c) => c.displayOnMainToolbar)"
              :key="cmd.key"
              :variant="cmd.variant === 'primary' ? 'primary' : 'outline'"
              size="sm"
              @click="controllerRef.value?.commands.value[cmd.key]?.execute()"
            >
              {{ cmd.labelKey }}
            </AppButton>
          </template>
        </ListTitleBar>
        <!-- Data Entry & Master Data get FormTitleBar & FormToolbar -->
        <template
          v-else-if="['dataEntry', 'maintenance', 'setup', 'processing'].includes(screen.kind)"
        >
          <FormTitleBar
            :form-title="screen.titleKey"
            :record-title="
              controllerRef.isNew.value
                ? undefined
                : controllerRef.entity.value?.requestNumber ||
                  controllerRef.entity.value?.documentNumber ||
                  controllerRef.entity.value?.id
            "
            :back-route="screen.pairedListRoute"
          />
          <FormToolbar
            :model="controllerRef.model.value"
            :executors="controllerRef.commands.value"
            :is-pending="controllerRef.isPending?.value ?? false"
            :is-new="controllerRef.isNew?.value ?? false"
            @save="controllerRef.commands.value['save']?.execute()"
            @cancel="controllerRef.commands.value['cancel']?.execute()"
          />
          <FormBanner
            v-if="controllerRef.model.value.ui.chrome.banner"
            :banner="controllerRef.model.value.ui.chrome.banner"
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

      <div
        v-if="!WorkingArea"
        class="flex h-full items-center justify-center text-[var(--color-neutral-400)]"
      >
        No working area defined for {{ screen.id }}
      </div>
    </div>

    <!-- Platform Side Panel -->
    <AppSidePane v-if="sidePanelContract" :contract="sidePanelContract" />

    <!-- Platform Managed Dialogs -->
    <AuditReasonDialog
      v-if="controllerRef?.dialogs?.auditReason"
      v-model:open="controllerRef.dialogs.auditReason.isOpen.value"
      v-model="controllerRef.dialogs.auditReason.reason.value"
      :title="controllerRef.dialogs.auditReason.title.value"
      :description="controllerRef.dialogs.auditReason.description.value"
      @confirm="controllerRef.dialogs.auditReason.confirm"
    />

    <ConfirmDialog
      v-if="controllerRef?.dialogs?.confirmation"
      v-model:open="controllerRef.dialogs.confirmation.isOpen.value"
      :title="controllerRef.dialogs.confirmation.title.value"
      :description="controllerRef.dialogs.confirmation.description.value"
      :variant="controllerRef.dialogs.confirmation.variant.value"
      :loading="controllerRef.isPending.value"
      @confirm="controllerRef.dialogs.confirmation.confirm"
    />
  </div>
  <div
    v-else
    class="flex h-full items-center justify-center font-medium text-[var(--color-danger-600)]"
  >
    Screen Definition Not Found: {{ screenId }}
  </div>
</template>
