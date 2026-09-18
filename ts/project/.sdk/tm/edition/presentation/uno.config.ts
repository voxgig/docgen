import Path from 'node:path'
import { createRequire } from 'node:module'
import slidevTokens from '@slidev/client/.generated/unocss-tokens.ts'

const clientRoot = Path.dirname(createRequire(import.meta.url).resolve('@slidev/client/package.json'))

export default {
  safelist: slidevTokens,
  // Include built-in icons and dynamic UI classes before the browser loads them.
  content: { filesystem: [Path.join(clientRoot, '**/*.{vue,ts}')] },
}
