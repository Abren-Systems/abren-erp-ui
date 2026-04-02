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
      'no-console': 'error',
      /**
       * 1. Modular Monolith Architectural Bounds
       */
      'boundaries/dependencies': [
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

      // 3. ENFORCE ARCHITECTURAL PATTERNS (DRY & PURE)
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name=/^use(Api)?Query$/] Property[key.name='queryKey'] > ArrayExpression",
          message:
            'Architectural Violation: Hardcoded Query Key arrays are forbidden. You MUST use a Query Key Factory (e.g., apKeys.lists()).',
        },
        {
          selector:
            "CallExpression[callee.name=/^use(Api)?Mutation$/] Property[key.name='onSuccess'] CallExpression[callee.property.name='invalidateQueries'] Property[key.name='queryKey'] > ArrayExpression",
          message:
            'Architectural Violation: Hardcoded Query Key arrays in invalidation are forbidden. You MUST use a Query Key Factory (e.g., apKeys.lists()).',
        },
        {
          selector:
            'TSAsExpression[typeAnnotation.typeName.name="any"], TSAsExpression[typeAnnotation.typeName.name="Error"]',
          message:
            'Architectural Violation: Unsafe error casting is forbidden. All API queries and mutations use ApiError by default. Do not use "as any" or "as Error".',
        },
      ],

      // Allow multi-word component names for now to ease transition
      'vue/multi-word-component-names': 'off',
    },
  },
  /**
   * 4. STRICT DOMAIN & APPLICATION LAYER GUARDRAILS
   *
   * Enforces "Branded ID" purity and "Date Purity".
   * Generic strings are banned for IDs and native Date objects are banned
   * to ensure nominal type safety and prevent timezone leakage.
   */
  {
    files: ['src/modules/**/application/**/*.ts', 'src/modules/**/domain/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name=/^use(Api)?Query$/] Property[key.name='queryKey'] > ArrayExpression",
          message:
            'Architectural Violation: Hardcoded Query Key arrays are forbidden. You MUST use a Query Key Factory (e.g., apKeys.lists()).',
        },
        {
          selector:
            "CallExpression[callee.name=/^use(Api)?Mutation$/] Property[key.name='onSuccess'] CallExpression[callee.property.name='invalidateQueries'] Property[key.name='queryKey'] > ArrayExpression",
          message:
            'Architectural Violation: Hardcoded Query Key arrays in invalidation are forbidden. You MUST use a Query Key Factory (e.g., apKeys.lists()).',
        },
        {
          selector:
            'TSAsExpression[typeAnnotation.typeName.name="any"], TSAsExpression[typeAnnotation.typeName.name="Error"]',
          message:
            'Architectural Violation: Unsafe error casting is forbidden. All API queries and mutations use ApiError by default. Do not use "as any" or "as Error".',
        },
        {
          selector:
            "Identifier[name=/^id$|Id$/][typeAnnotation.typeAnnotation.type='TSStringKeyword']",
          message:
            'Architectural Violation: Generic "string" IDs are forbidden in Domain/Application layers. You MUST use a Branded ID (e.g., Brand<string, "EntityId">) for nominal type safety.',
        },
        {
          selector: "NewExpression[callee.name='Date']",
          message:
            'Architectural Violation: Native "new Date()" is forbidden in Domain/Application layers. Use "BusinessDate.today()" or "BusinessDate.fromIso()" to ensure ISO-8601 consistency.',
        },
        {
          selector: "TSTypeReference[typeName.name='Date']",
          message:
            'Architectural Violation: Native "Date" type is forbidden in Domain/Application layers. Use the "IsoDate" branded type from @/shared/domain/business-date.',
        },
      ],
    },
  },
)
