import glob, os, re

def replace_in_files():
    files = glob.glob('docs/**/*.md', recursive=True) + glob.glob('docs/*.md')
    for file_path in files:
        if not os.path.isfile(file_path): continue
        with open(file_path, 'r') as f: content = f.read()

        # Core -> Shared
        content = content.replace('src/core/', 'src/shared/')
        content = content.replace('src/core`', 'src/shared`')
        content = content.replace('@/core/', '@/shared/')

        # Flattened Modules
        content = content.replace('modules/business/finance/ap/payment-requests', 'modules/finance/ap')
        content = content.replace('business/finance/ap/payment-requests', 'finance/ap')
        content = content.replace('modules/business/finance', 'modules/finance')
        content = content.replace('business/finance', 'finance')
        
        content = content.replace('modules/business/reporting', 'modules/reporting')
        content = content.replace('business/reporting', 'reporting')

        content = content.replace('modules/platform/core', 'modules/core')
        content = content.replace('modules/platform/workflows', 'modules/workflows')
        content = content.replace('platform/core', 'core')
        content = content.replace('platform/workflows', 'workflows')

        # Generic business/platform wrappers
        content = content.replace('modules/business/', 'modules/')
        content = content.replace('modules/platform/', 'modules/')

        # Mapper placement
        content = content.replace('domain/mappers', 'infrastructure/mappers')

        # Purity rule notes
        content = content.replace('domain layer mapping', 'infrastructure layer mapping')

        with open(file_path, 'w') as f: f.write(content)

replace_in_files()
print('DONE')
