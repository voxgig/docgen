import Fs from 'node:fs'
import Path from 'node:path'
import Os from 'node:os'
import { spawnSync } from 'node:child_process'
const MarkdownIt = require('markdown-it')
const md = new MarkdownIt({ html: false })
const PACKAGE = Path.resolve(__dirname, '..')

// The local gate and Vale consume this exact extracted prose and vocabulary.
// Fenced examples, inline identifiers, HTML code, scripts, and styles are not prose.
// A URL IS NOT PROSE. Its characters are a path, not English, and every word
// rule here will eventually trip over one: a Microsoft docs link in NoFrixion's
// spec carries `en-us`, the hyphen is a word boundary, and `us` failed the
// neutral-voice check on five generated pages. Stripped before any check runs,
// the same way code blocks already are.
const stripUrls = (s: string): string => s.replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s<>"')\]]+/gi, ' ')

export function proseText(source: string, format = 'md'): string {
  if (format === 'html' || format === 'vue') {
    if (format === 'vue') source = source.replace(/\{\{[^]*?\}\}/g, ' ')
    source = source.replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[^]*?-->/g, '').replace(/<\/(?:p|h[1-6]|li|tr|td|th|div|nav|header|main|summary|details|footer|aside|span)>/gi, '\n\n').replace(/<[^>]+>/g, ' ')
    return stripUrls(md.utils.unescapeAll(source)).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  }
  source = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/<!--[\s\S]*?-->/g, '')
  const collect = (tokens: any[]): string => tokens.map(t => {
    if (['fence','code_block','code_inline','html_block','html_inline'].includes(t.type)) return ''
    if (t.children) return collect(t.children)
    return t.type === 'text' ? md.utils.unescapeAll(t.content) : t.type.endsWith('_close') ? '\n\n' : ' '
  }).join(' ')
  return stripUrls(collect(md.parse(source, {}))).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}
// The prose docgen itself wrote: everything except table cells. See the voice
// rule in checkText for why the distinction exists.
function authored(source: string, format: string): string {
  const stripped = 'html' === format || 'vue' === format
    ? source.replace(/<td\b[^>]*>[\s\S]*?<\/td>/gi, ' ')
    : source.split('\n').filter(line => !/^\s*\|/.test(line)).join('\n')
  return proseText(stripped, format)
}

export function checkText(source: string, format = 'md', rejectFile = Path.join(PACKAGE, 'qa/styles/config/vocabularies/Docgen/reject.txt')): string[] {
  const text = proseText(source, format), errors: string[] = []
  const patterns = Fs.readFileSync(rejectFile, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))
  for (const pattern of patterns) if (new RegExp('\\b(?:' + pattern + ')\\b', 'i').test(text)) errors.push('Avoid: ' + pattern)
  if (/\b(\w+)[ \t]+\1\b/i.test(text)) errors.push('Remove the repeated word')
  if (/—/.test(text)) errors.push('Use a comma, colon, parentheses, or a new sentence instead of an em dash')
  // THE VOICE RULE DOES NOT READ TABLE CELLS.
  //
  // Tables are where QUOTED specification text lives: every field and parameter
  // description in the API reference is the upstream author's sentence, not
  // ours. NoFrixion's spec says "the ID returned by the service provider
  // initiating the payment for us", and five generated pages failed a rule that
  // exists to keep DOCGEN's own voice neutral. Policing someone else's spec
  // makes the gate unpassable for any API whose descriptions use first person,
  // and there will be many.
  //
  // Only this rule is narrowed. Banned phrases, em dashes, emoji, exclamation
  // marks and repeated words still apply everywhere, because those are defects
  // on the page whoever wrote them.
  if (/\b(I|me|my|mine|we|us|our|ours)\b/i.test(authored(source, format))) errors.push('Use neutral or second-person prose')
  if (/\p{Extended_Pictographic}/u.test(text)) errors.push('Do not use emoji in documentation')
  if (/!/.test(text)) errors.push('Use statements without exclamation marks')
  return errors
}
export function runQA(manifestPath: string, root = process.cwd(), vale = true): { files: number, errors: string[] } {
  const manifest = JSON.parse(Fs.readFileSync(Path.resolve(root, manifestPath), 'utf8'))
  if (!Array.isArray(manifest.files) || !manifest.files.length) throw new Error('Text QA manifest has no documentation files')
  const safe = (p: string) => {
    const abs = Path.resolve(root, p)
    if (abs === root || !abs.startsWith(Path.resolve(root) + Path.sep)) throw new Error('QA path escapes the repository: ' + p)
    return abs
  }
  const config = safe(manifest.config), reject = Path.join(Path.dirname(config),'styles/config/vocabularies/Docgen/reject.txt')
  const errors: string[] = [], temp = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'docgen-prose-'))
  try {
    const inputs: string[] = []
    for (const [index, file] of manifest.files.entries()) {
      const text = Fs.readFileSync(safe(file), 'utf8'), format = file.endsWith('.html') ? 'html' : file.endsWith('.vue') ? 'vue' : 'md'
      errors.push(...checkText(text, format, reject).map(e => file + ': ' + e))
      if (format === 'html') {
        for (const match of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
          const url = md.utils.unescapeAll(match[1])
          if (/^(?:[a-z]+:|\/\/)/i.test(url)) continue
          const [target, anchor] = url.split('#')
          let destination = Path.resolve(Path.dirname(safe(file)), decodeURIComponent(target.split('?')[0]) || Path.basename(file))
          const route = manifest.routes?.[Path.relative(root, destination).split(Path.sep).join('/')]
          if (route) destination = safe(route)
          if (!destination.startsWith(Path.resolve(root) + Path.sep) || !Fs.existsSync(destination)) {
            errors.push(file + ': broken local link: ' + url)
          } else if (anchor && destination.endsWith('.html')) {
            const document = Fs.readFileSync(destination, 'utf8')
            if (!document.includes('id="' + decodeURIComponent(anchor) + '"')) errors.push(file + ': missing anchor: ' + url)
          }
        }
      }
      const dest = Path.join(temp, index + '.txt')
      Fs.writeFileSync(dest, proseText(text, format)); inputs.push(dest)
    }
    if (vale) {
      // maxBuffer, because the default is 1MB and Vale's report scales with the
      // documentation. A 49-entity API produces 64 pages, and the run died on
      //
      //   Vale is required for text QA: spawnSync vale ENOBUFS
      //
      // which reads as a missing binary and is nothing of the kind: Vale ran,
      // found plenty, and its own output overflowed the pipe. Small doc sets
      // never reach it, so this only ever appears on the projects whose reports
      // matter most.
      const result = spawnSync('vale', ['--config=' + config, '--minAlertLevel=error', ...inputs],
        { encoding:'utf8', cwd:root, maxBuffer: 64 * 1024 * 1024 })
      if (result.error) errors.push('Vale is required for text QA: ' + result.error.message)
      else if (result.status !== 0) {
        let output = (result.stdout || '') + (result.stderr || '')
        inputs.forEach((p,i) => { output = output.split(p).join(manifest.files[i]) })
        errors.push(output)
      }
    }
  } finally { Fs.rmSync(temp, { recursive:true, force:true }) }
  return { files: manifest.files.length, errors }
}
