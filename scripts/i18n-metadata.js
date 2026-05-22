import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJsonPath = resolve(__dirname, '../package.json')
const outputPath = resolve(__dirname, '../src/i18n/package-metadata.js')

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

const content = `// AUTO-GENERATED FILE - DO NOT EDIT
// This file ensures that package.json metadata is extracted by vue-gettext.
// It is generated automatically before extraction.

export const metadata = {
  description: $gettext('${pkg.description}')
}
`

fs.writeFileSync(outputPath, content, 'utf8')
console.log('✅ Synchronized package.json metadata for i18n extraction.')
