import eslintPluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'
import pluginBoundaries from 'eslint-plugin-boundaries'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    plugins: {
      boundaries: pluginBoundaries,
    },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/shared/**/*' },
        { type: 'app', pattern: 'src/app/**/*' },
        {
          type: 'domain',
          pattern: 'src/modules/**/domain/**/*',
        },
        {
          type: 'application',
          pattern: 'src/modules/**/application/**/*',
        },
        {
          type: 'infrastructure',
          pattern: 'src/modules/**/infrastructure/**/*',
        },
        {
          type: 'ui',
          pattern: 'src/modules/**/ui/**/*',
        },
      ],
    },
    files: ['**/*.ts', '**/*.vue', '**/*.js', '**/*.mjs'],
    rules: {
      /**
       * 1. Modular Monolith Architectural Bounds
       */
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message:
            'Architectural boundary violation: ${file.type} is not allowed to import from ${dependency.type}',
          rules: [
            // The Leaf Node Rule: Shared Kernel can only import other shared files.
            { from: 'shared', allow: ['shared'] },

            // App Shell orchestrates everything
            { from: 'app', allow: ['shared', 'ui', 'application', 'domain', 'infrastructure'] },

            // Pure Domain: Can only rely on itself and Shared Kernel
            {
              from: 'domain',
              allow: ['shared', 'domain'],
            },

            // Application Layer: Orchestrates Domain
            {
              from: 'application',
              allow: ['shared', 'domain', 'application'],
            },

            // Infrastructure Layer: Translates outwards, can map to Domain
            {
              from: 'infrastructure',
              allow: ['shared', 'domain', 'infrastructure'],
            },

            // UI Layer: Presents data, banned from accessing Infrastructure directly
            {
              from: 'ui',
              allow: ['shared', 'domain', 'application', 'ui'],
            },
          ],
        },
      ],

      // Cross-Module Coupling Ban
      // Using generic restricted imports to prevent any module from accessing another module's internal folders.
      // E.g., importing from '../ap/...', '../../ap/...', etc.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // Domain and Infrastructure layers cannot use Pinia state
              group: ['pinia'],
              message:
                'Architectural Violation: Domain and Infrastructure layers must remain pure and cannot import Pinia. Pinia is restricted to the UI layer and Core Auth.',
            },
            {
              group: ['../*/**', '../../*/**', '../*/../*/**'],
              message:
                'Architectural Violation: Cross-Module internal coupling is banned. Use @/shared or explicit paths.',
            },
          ],
        },
      ],

      'no-restricted-globals': [
        'error',
        {
          name: 'alert',
          message:
            'Architectural Violation: Use the toast notification system instead of window.alert().',
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
