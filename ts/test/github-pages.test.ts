import { test } from 'node:test'
import Assert from 'node:assert/strict'
import Fs from 'node:fs'
import Os from 'node:os'
import Path from 'node:path'
import { setupGitHubPages } from '../dist/admin/github-pages'

function fixture(mode?: string, error?: string) {
  const root = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'docgen-pages-setup-'))
  Fs.mkdirSync(Path.join(root, '.sdk/model'), { recursive: true })
  Fs.mkdirSync(Path.join(root, '.github/workflows'), { recursive: true })
  Fs.writeFileSync(Path.join(root, '.sdk/model/sdk.json'), JSON.stringify({ main: { kit: { doc: {
    ci: { branch: 'release' }, edition: { site: { kind: 'github-pages', output: { path: 'docs' } } },
  } } } }))
  Fs.writeFileSync(Path.join(root, '.github/workflows/docgen.yml'), 'name: Documentation\n')
  const calls: string[][] = []
  const run = (args: string[], cwd: string) => {
    Assert.equal(cwd, root); calls.push(args)
    const ok = (data: any) => ({ status: 0, stdout: JSON.stringify(data), stderr: '' })
    if (args[0] === 'repo') return ok({ nameWithOwner: 'example/sdk', url: 'https://github.com/example/sdk' })
    if (args[0] === 'auth') return ok({})
    Assert.deepEqual(args.slice(0, 4), ['api', '--hostname', 'github.com', 'repos/example/sdk/pages'])
    if (error) return { status: 1, stdout: JSON.stringify({ status: error }), stderr: 'HTTP ' + error }
    if (args.includes('--method')) {
      Assert.equal(args[args.indexOf('--method') + 1], mode ? 'PUT' : 'POST')
      Assert.deepEqual(args.slice(-2), ['-f', 'build_type=workflow'])
      mode = 'workflow'; return ok({})
    }
    return mode ? ok({ build_type: mode, html_url: 'https://example.github.io/sdk/' }) : { status: 1, stdout: '{"status":"404"}', stderr: 'HTTP 404' }
  }
  return { root, run, calls, clean: () => Fs.rmSync(root, { recursive: true, force: true }) }
}

test('Pages setup creates once, updates branch publishing, and leaves Actions sites alone', () => {
  for (const mode of [undefined, 'legacy', 'workflow']) {
    const f = fixture(mode)
    try {
      const result = setupGitHubPages(f.root, {}, f.run)
      Assert.equal(result.configured, true)
      Assert.equal(result.branch, 'release')
      Assert.equal(result.operation, mode === 'workflow' ? 'none' : mode ? 'update' : 'create')
      Assert.equal(setupGitHubPages(f.root, {}, f.run).operation, 'none')
      Assert.equal(f.calls.filter(a => a.includes('--method')).length, mode === 'workflow' ? 0 : 1)
    } finally { f.clean() }
  }
})

test('Pages dry-run/check and GitHub failures never write settings', () => {
  for (const options of [{ dryrun: true }, { check: true }]) {
    const f = fixture()
    try { Assert.equal(setupGitHubPages(f.root, options, f.run).configured, false); Assert.ok(!f.calls.some(a => a.includes('--method'))) }
    finally { f.clean() }
  }
  for (const error of ['401', '403', '500']) {
    const f = fixture(undefined, error)
    try { Assert.throws(() => setupGitHubPages(f.root, {}, f.run), /HTTP/); Assert.ok(!f.calls.some(a => a.includes('--method'))) }
    finally { f.clean() }
  }
})

test('Pages setup refuses missing local generation before contacting GitHub', () => {
  const f = fixture()
  try {
    Fs.unlinkSync(Path.join(f.root, '.github/workflows/docgen.yml'))
    Assert.throws(() => setupGitHubPages(f.root, {}, f.run), /Generate .github/)
    Assert.equal(f.calls.length, 0)
  } finally { f.clean() }
})
