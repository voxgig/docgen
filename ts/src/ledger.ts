import Path from 'node:path'

// What a generation run wrote, grouped by the output roots it owns, so a later
// run can retire what it does not emit again. Overwriting in place is safe only
// while the file set is stable, and a page per model item ties that set to the
// model: an entity leaving the spec takes its page with it.
export type Ledger = { version: number, roots: string[], files: string[] }

export type Owned = { roots: string[], files: string[], refused: string[] }

export type PrunePlan = { files: string[], folders: string[], refused: string[] }

const VERSION = 2

export function isRelativePath(value: unknown): value is string {
  return 'string' === typeof value && '' !== value && !value.includes('\\') &&
    !Path.isAbsolute(value) && !value.split('/').some(x => !x || '.' === x || '..' === x) &&
    !/[\x00-\x1f]/.test(value)
}

export function relativePath(value: string): string {
  if (!isRelativePath(value)) {
    throw new Error('Expected a relative path inside the SDK repository: ' + value)
  }
  return value
}

export function inside(root: string, rel: string, fs: any): string {
  const dest = Path.join(root, relativePath(rel))
  // Reject symlink ancestors before any read or write can leave the project.
  let part = root
  for (const p of rel.split('/')) {
    part = Path.join(part, p)
    if (fs.existsSync(part) && fs.lstatSync(part).isSymbolicLink()) {
      throw new Error('Documentation path is a symlink: ' + part)
    }
  }
  return dest
}

export function within(root: string, path: string): boolean {
  return path === root || path.startsWith(root + '/')
}

export function ledgerText(roots: string[], files: string[]): string {
  const sorted = (list: string[]) => [...new Set(list)].sort()
  const ledger: Ledger = { version: VERSION, roots: sorted(roots), files: sorted(files) }
  return JSON.stringify(ledger, null, 2) + '\n'
}

// A ledger is data on disk and can say anything, so nothing here throws and no
// entry is taken on trust. A stored ledger without roots keeps its file-level
// authority, and withholds the directory pruning that needs a root to stop at.
export function readLedger(fs: any, path: string): Owned {
  if (!fs.existsSync(path)) {
    return { roots: [], files: [], refused: [] }
  }
  let data: any
  try {
    data = JSON.parse(String(fs.readFileSync(path, 'utf8')))
  }
  catch (err: any) {
    return { roots: [], files: [], refused: ['<unreadable: ' + (err?.message || err) + '>'] }
  }
  const refused: string[] = []
  const keep = (list: any, what: string): string[] => {
    if (!Array.isArray(list)) {
      refused.push('<' + what + ' is not a list>')
      return []
    }
    return list.filter((value: unknown) => {
      if (isRelativePath(value)) return true
      refused.push(String(value))
      return false
    })
  }
  const files = keep(data?.files, 'files')
  const roots = null == data?.roots ? files : keep(data.roots, 'roots')
  return { roots, files, refused }
}

export function prunePlan(
  fs: any, root: string, previous: Owned, emitted: Set<string>,
): PrunePlan {
  const plan: PrunePlan = { files: [], folders: [], refused: [...previous.refused] }
  const owned = (path: string) => previous.roots.some(r => within(r, path))
  for (const path of previous.files) {
    if (emitted.has(path)) continue
    if (!owned(path)) {
      plan.refused.push(path)
      continue
    }
    let at: string
    try {
      at = inside(root, path, fs)
    }
    catch {
      plan.refused.push(path)
      continue
    }
    if (!fs.existsSync(at)) continue
    if (!fs.lstatSync(at).isFile()) {
      plan.refused.push(path)
      continue
    }
    plan.files.push(path)
  }
  const candidates = new Set<string>()
  for (const path of plan.files) {
    const parts = path.split('/')
    parts.pop()
    // A root is the floor: an empty directory above one belongs to the project.
    while (parts.length && owned(parts.join('/'))) {
      candidates.add(parts.join('/'))
      parts.pop()
    }
  }
  const going = new Set(plan.files), empty = new Set<string>()
  // Deepest first, so a child is decided before the parent that holds it.
  for (const dir of [...candidates].sort((a, b) =>
    b.split('/').length - a.split('/').length || a.localeCompare(b))) {
    const at = Path.join(root, dir)
    if (!fs.existsSync(at)) continue
    const entries: string[] = fs.readdirSync(at).map(String)
    if (entries.every(name => going.has(dir + '/' + name) || empty.has(dir + '/' + name))) {
      empty.add(dir)
      plan.folders.push(dir)
    }
  }
  return plan
}

export function applyPrune(fs: any, root: string, plan: PrunePlan): void {
  for (const path of plan.files) {
    fs.unlinkSync(inside(root, path, fs))
  }
  // Already deepest first, and skipped if anything has arrived since.
  for (const dir of plan.folders) {
    const at = Path.join(root, dir)
    if (fs.existsSync(at) && 0 === fs.readdirSync(at).length) {
      fs.rmdirSync(at)
    }
  }
}
