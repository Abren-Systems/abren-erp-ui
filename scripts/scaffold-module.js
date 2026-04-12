#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import console from 'node:console'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// 1. Parse Arguments
const moduleName = process.argv[2]
if (!moduleName || moduleName.includes('/')) {
  console.error('\n❌ Error: Please provide a flat module name (no slashes).')
  console.error('Usage: npm run generate <module_name>')
  console.error('Example: npm run generate invoices\n')
  process.exit(1)
}

// 2. Resolve Paths
const modulePath = moduleName.toLowerCase()
const fullPath = path.join(ROOT, 'src/modules', modulePath)

if (fs.existsSync(fullPath)) {
  console.error(`\n❌ Error: Module directory already exists at: src/modules/${modulePath}\n`)
  process.exit(1)
}

// 3. Define the 4-Layer Structure
const directories = [
  '',
  'domain',
  'infrastructure',
  'application',
  'application/composables',
  'ui',
  'ui/components',
  'ui/pages',
  'ui/grids',
]

const idStr = modulePath
const dashRegexGlobal = new RegExp('-.', 'g')
const dashRegexStart = new RegExp('(^|-).', 'g')

const camelCaseName = moduleName.replace(dashRegexGlobal, (x) => String(x[1]).toUpperCase())
const pascalCaseName = moduleName.replace(dashRegexStart, (x) =>
  String(x).replace('-', '').toUpperCase(),
)

// 4. Define Boilerplate Files
const files = {
  'index.ts': `import type { BusinessDomain } from '@/shared/types/module.types'\nimport routes from './routes'\n\nexport const ${camelCaseName}Module: BusinessDomain = {\n  id: '${idStr}',\n  name: '${pascalCaseName}',\n  category: 'business',\n  routes,\n  permissions: [],\n  menuItems: [\n    { label: '${pascalCaseName}', route: '${pascalCaseName}List', icon: 'file-text' }\n  ],\n}\n`,
  'routes.ts': `import type { RouteRecordRaw } from 'vue-router'\n\nconst routes: RouteRecordRaw[] = [\n  {\n    path: '${moduleName}',\n    name: '${pascalCaseName}List',\n    component: () => import('./ui/pages/${pascalCaseName}sListPage.vue'),\n  },\n]\n\nexport default routes\n`,
  [`ui/pages/${pascalCaseName}sListPage.vue`]: `<script setup lang="ts">\n// Orchestrator List Page for the ${moduleName} module\n</script>\n\n<template>\n  <div class="p-6 space-y-6">\n    <header class="flex items-center justify-between">\n      <div>\n        <h1 class="text-2xl font-bold tracking-tight">${pascalCaseName}s</h1>\n      </div>\n    </header>\n    <!-- DataGrid goes here -->\n  </div>\n</template>\n`,
  [`domain/${moduleName}.types.ts`]: `import type { Brand } from '@/shared/types/brand.types'\n\nexport type ${pascalCaseName}Id = Brand<string, '${pascalCaseName}Id'>\n\nexport interface ${pascalCaseName} {\n  id: ${pascalCaseName}Id\n}\n`,
  [`infrastructure/api.types.ts`]: `import type { components } from '@/shared/api/generated.types'\n\n// export type ${pascalCaseName}DTO = components['schemas']['${pascalCaseName}Read']\n`,
  [`infrastructure/${moduleName}_adapter.ts`]: `import { apiGet, apiPost } from '@/shared/api/http-client'\nimport { eventBus } from '@/shared/event-bus/event-bus'\nimport { toId, type ModuleId } from '@/shared/types/brand.types'\n// import type { ${pascalCaseName}DTO } from './api.types'\n\nexport const ${camelCaseName}Adapter = {\n  // async create(dto: any): Promise<void> {\n  //   await apiPost('/api/v1/${moduleName}', dto)\n  //   // Example: Emit a Fat Domain Event with metadata\n  //   eventBus.emit('${moduleName}:created', { id: toId(dto.id) }, {\n  //     sourceModule: toId<ModuleId>('${moduleName}')\n  //   })\n  // }\n}\n`,
  'infrastructure/mappers.ts': `import { toId } from '@/shared/types/brand.types'\nimport type { ${pascalCaseName}Id } from '../domain/${moduleName}.types'\n\nexport class ${pascalCaseName}Mapper {\n  // static toDomain(dto: any) {\n  //   return { id: toId<${pascalCaseName}Id>(dto.id) }\n  // }\n}\n`,
  'application/keys.ts': `import type { ${pascalCaseName}Id } from '../domain/${moduleName}.types'\n\nexport const ${camelCaseName}Keys = {\n  all: ['${moduleName}'] as const,\n  lists: () => [...${camelCaseName}Keys.all, 'list'] as const,\n  details: () => [...${camelCaseName}Keys.all, 'detail'] as const,\n  detail: (id: ${pascalCaseName}Id) => [...${camelCaseName}Keys.details(), id] as const,\n}\n`,
  [`application/composables/use${pascalCaseName}s.ts`]: `import { useApiQuery } from '@/shared/composables/useApiQuery'\nimport { ${camelCaseName}Adapter } from '../../infrastructure/${moduleName}_adapter'\nimport { ${pascalCaseName}Mapper } from '../../infrastructure/mappers'\nimport { ${camelCaseName}Keys } from '../keys'\n\nexport function use${pascalCaseName}s() {\n  return useApiQuery(\n    ${camelCaseName}Keys.lists(),\n    async () => {\n      // const dtos = await ${camelCaseName}Adapter.list()\n      // return dtos.map((d) => ${pascalCaseName}Mapper.toDomain(d))\n      return []\n    }\n  )\n}\n`,
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
  fs.writeFileSync(path.join(fullPath, file), String(content).trim() + '\n')
  console.log(`  📄 Created: ${file}`)
})

console.log(`\n✅ Module scaffolding complete!`)
console.log(`\n⚠️  Don't forget to register your module in: src/modules/index.ts\n`)
