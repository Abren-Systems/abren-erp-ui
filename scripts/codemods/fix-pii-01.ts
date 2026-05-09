import * as fs from 'fs'
import * as path from 'path'

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file))
    if (stat.isDirectory()) {
      fileList = getFiles(path.join(dir, file), fileList)
    } else if (file.endsWith('.vue')) {
      fileList.push(path.join(dir, file))
    }
  }
  return fileList
}

const vueFiles = getFiles(path.resolve('src/modules'))
let modifiedCount = 0

for (const file of vueFiles) {
  let content = fs.readFileSync(file, 'utf8')
  let modified = false

  // Replace inject(ScreenControllerKey) usage
  const targetUnwrap = 'const ctrl = inject(ScreenControllerKey)!.value! as any // eslint-disable-line @typescript-eslint/no-explicit-any'
  const newUnwrap = 'const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any'
  
  if (content.includes(targetUnwrap)) {
    content = content.replace(targetUnwrap, newUnwrap)
    modified = true
  }

  const targetUnwrapNoComment = 'const ctrl = inject(ScreenControllerKey)!.value! as any'
  if (content.includes(targetUnwrapNoComment) && !content.includes(newUnwrap)) {
      content = content.replace(targetUnwrapNoComment, 'const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any')
      modified = true
  }

  // Also fix the <any>() if it was already applied
  if (content.includes('useScreenControllerContext<any>()')) {
      content = content.replace('useScreenControllerContext<any>()', 'const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any')
      modified = true
  }
  
  if (content.includes('useScreenControllerContext() as any') && !content.includes('eslint-disable-line')) {
      content = content.replace('useScreenControllerContext() as any', 'useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any')
      modified = true
  }

  // Also remove 'inject' and 'ScreenControllerKey' from imports if they exist and add useScreenControllerContext
  if (modified) {
    if (content.includes("import { inject } from 'vue'")) {
        // Just remove it if it's alone, or we leave it. ESLint will clean up unused imports.
        // It's safer to just rely on eslint --fix to remove unused inject.
    }
    
    const oldImport = "import { ScreenControllerKey } from '@/platform/screen-runtime'"
    const newImport = "import { useScreenControllerContext } from '@/platform/screen-runtime'"
    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport)
    } else {
      const oldImport2 = "import { ScreenControllerKey } from '@/platform/screen-runtime/injection-keys'"
      if (content.includes(oldImport2)) {
         content = content.replace(oldImport2, newImport)
      } else {
         // Fallback if not found, add to top of script setup
         if (!content.includes('useScreenControllerContext')) {
             content = content.replace('<script setup lang="ts">', '<script setup lang="ts">\nimport { useScreenControllerContext } from \'@/platform/screen-runtime\'')
         }
      }
    }
    
    fs.writeFileSync(file, content, 'utf8')
    console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`)
    modifiedCount++
  }
}

console.log(`\n🎉 Codemod complete! Fixed ${modifiedCount} files.`)
