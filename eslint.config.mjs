import eslintPluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      // 1. Enforce Module Architectural Boundaries
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // UI layer cannot directly import from Infrastructure layer
              group: ['*/infrastructure/*'],
              message:
                'Architectural Violation: The UI layer must not directly import from the Infrastructure layer. Use the Application (composables) layer instead.',
            },
            {
              // Domain and Infrastructure layers cannot use Pinia state
              group: ['pinia'],
              message:
                'Architectural Violation: Domain and Infrastructure layers must remain pure and cannot import Pinia. Pinia is restricted to the UI layer and Core Auth.',
            },
          ],
        },
      ],

      // 2. Enforce Design System
      'vue/no-restricted-static-attribute': [
        'error',
        {
          key: 'style',
          message:
            'Design System Violation: Inline styles are strictly forbidden. You must use Tailwind utility classes mapping to the formal Design System tokens.',
        },
      ],

      // Allow multi-word component names for now to ease transition
      'vue/multi-word-component-names': 'off',
    },
  },
)
