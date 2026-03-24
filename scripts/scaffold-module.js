#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import console from 'node:console'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// 1. Parse Arguments
const arg = process.argv[2]
if (!arg) {
  console.error('\n❌ Error: Please provide a module path.')
  console.error('Usage: npm run generate <category>/<domain>/<module_name>')
  console.error('Example: npm run generate business/sales/invoices\n')
  process.exit(1)
}

// 2. Resolve Paths
const modulePath = arg.toLowerCase().replaceAll('\\\\', '/')
const fullPath = path.join(ROOT, 'src/modules', modulePath)
const parts = modulePath.split('/')
const moduleName = String(parts[parts.length - 1])

if (fs.existsSync(fullPath)) {
  console.error(`\n❌ Error: Module directory already exists at: src/modules/${modulePath}\n`)
  process.exit(1)
}

// 3. Define the 4-Layer Structure
const directories = [
  '',
  'domain',
  'domain/models',
  'domain/mappers',
  'infrastructure',
  'application',
  'application/composables',
  'ui',
  'ui/components',
  'ui/pages',
  'ui/grids',
  'ui/utils',
]

// Extract strings before template literals to avoid oxlint regex parsing bugs
const idStr = modulePath.replaceAll('/', '.')

const dashRegexGlobal = new RegExp('-.', 'g')
const dashRegexStart = new RegExp('(^|-).', 'g')

const camelCaseName = moduleName.replace(dashRegexGlobal, (x) => String(x[1]).toUpperCase())
const pascalCaseName = moduleName.replace(dashRegexStart, (x) =>
  String(x).replace('-', '').toUpperCase(),
)

// 4. Define Boilerplate Files
const files = {
  'index.ts': `import { type ModuleDefinition } from '@/core/types/module.types'\nimport { routes } from './routes'\n\nexport const ${camelCaseName}Module: ModuleDefinition = {\n  id: '${idStr}',\n  name: '${moduleName}',\n  routes,\n  menus: [],\n}\n`,
  'routes.ts': `import type { RouteRecordRaw } from 'vue-router'\n\nexport const routes: RouteRecordRaw[] = [\n  {\n    path: '/${moduleName}',\n    name: '${moduleName}-root',\n    component: () => import('./ui/pages/${pascalCaseName}Page.vue'),\n    meta: {\n      requiresAuth: true,\n    },\n  },\n]\n`,
  [`ui/pages/${pascalCaseName}Page.vue`]: `<script setup lang="ts">\n// Entry point for the ${moduleName} module\n</script>\n\n<template>\n  <div class="flex h-full flex-col gap-5">\n    <div class="flex shrink-0 items-start justify-between">\n      <div>\n        <h1 class="m-0 text-heading text-[var(--color-grid-text)]">\n          ${moduleName.toUpperCase()}\n        </h1>\n      </div>\n    </div>\n  </div>\n</template>\n`,
  [`domain/models/${moduleName}.types.ts`]: `import type { Brand } from '@/core/types/brand.types'\n\nexport type ${pascalCaseName}Id = Brand<string, '${pascalCaseName}Id'>\n`,
  [`infrastructure/${moduleName}_adapter.ts`]: `import { apiGet, apiPost } from '@/core/api/http-client'\n\n// API calls go here\n`,
  [`application/composables/use${pascalCaseName}.ts`]: `import { useApiQuery } from '@/core/composables/useApiQuery'\n\n// TanStack queries go here\n`,
}

// 5. Generate
console.log(`\n🏗️  Scaffolding compliant 4-layer module: src/modules/${modulePath}...\n`)

directories.forEach((dir) => {
  const dirPath = path.join(fullPath, dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`  📂 Created: ${dir}`)
  }
})

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(fullPath, file), String(content).trim() + '\\n')
  console.log(`  📄 Created: ${file}`)
})

console.log(`\n✅ Module scaffolding complete!`)
console.log(`\n⚠️  Don't forget to register your module in: src/modules/index.ts\n`)
