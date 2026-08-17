// @voxgig/docgen as an SDKGEN PACKAGE.
//
// docgen supplies documentation ITEMS; @voxgig/sdkgen supplies the `docs`
// kind that installs and generates them. So what this suite can check on its
// own is the package's own shape — the manifest against the disk, and every
// item's model file — which is exactly what a consumer's `package add`
// validates before it writes anything.
//
// The end-to-end proof (install into a project, generate, clean `doctor`)
// belongs to whoever has sdkgen present: `voxgig-sdkgen package check .`
// followed by `package add` in a real project. It is not duplicated here,
// because a copy of it that could not run the real installer would be
// testing a mock.

import { test, describe } from 'node:test'
import { equal, ok, deepEqual } from 'node:assert'

import Fs from 'node:fs'
import Path from 'node:path'
import { spawnSync } from 'node:child_process'


const ROOT = Path.resolve(__dirname, '..')
const SDK = Path.join(ROOT, '.sdk')

const manifest = JSON.parse(
  Fs.readFileSync(Path.join(ROOT, 'sdkgen-package.json'), 'utf8'))

const { select } = require('../dist/docgen.js')


describe('vendored helpers', () => {

  // `select` used to be jostraca's, re-exported from this package's public
  // API. jostraca 0.33 removed it; rather than pin the dependency tree back
  // for a four-line function, it was vendored — which makes it OURS, and
  // therefore ours to test. It had no test here while it was jostraca's, so
  // this is the first thing standing between a rewrite and a silent
  // behaviour change for anyone importing it.

  test('calls the matching branch', () => {
    equal(select('b', { a: () => 'A', b: () => 'B' }), 'B')
  })


  test('a MISSING key yields undefined rather than throwing', () => {
    // The property that matters. It branches on model values where most keys
    // have no case, so throwing would turn "nothing to emit here" into a
    // failed generate.
    equal(select('nope', { a: () => 'A' }), undefined)
  })


  test('a missing map is not an error either', () => {
    equal(select('a', undefined as any), undefined)
  })


  test('the branch is CALLED, not returned', () => {
    // Returning the function instead of its result would satisfy a laxer
    // test and break every caller.
    let ran = false
    select('a', { a: () => { ran = true; return 1 } })
    equal(ran, true)
  })

})


// Every COMMITTED file under `.sdk`, as tarball-style relative paths.
//
// Tracked rather than "whatever is on disk": an untracked local file is not
// part of the package, and demanding npm ship one would be a red build for
// somebody's scratch file.
function sdkFiles(): string[] {
  const res = spawnSync('git', ['ls-files', '.sdk'], {
    cwd: ROOT, encoding: 'utf8',
  })

  equal(res.status, 0, 'git ls-files failed: ' + res.stderr)

  return res.stdout.split('\n').filter((p: string) => '' !== p).sort()
}


describe('sdkgen package', () => {

  test('the manifest declares a package of the schema sdkgen knows', () => {
    equal(manifest.sdkgen.package, 1)
    equal(manifest.name, '@voxgig/docgen')
    ok(null != manifest.provides.docs, 'no docs items provided')
  })


  test('the manifest version matches package.json', () => {
    // `package list` shows the MANIFEST's version, and `package update`
    // compares against the source on disk — so two versions that disagree
    // make a consumer's report a lie.
    const pkg = JSON.parse(
      Fs.readFileSync(Path.join(ROOT, 'package.json'), 'utf8'))

    equal(manifest.version, pkg.version)
  })


  test('npm ships the package content', () => {
    // A manifest npm does not publish makes an installed package that
    // `package add` refuses.
    const pkg = JSON.parse(
      Fs.readFileSync(Path.join(ROOT, 'package.json'), 'utf8'))

    ok(pkg.files.includes('.sdk'), 'files omits .sdk')
    ok(pkg.files.includes('sdkgen-package.json'), 'files omits the manifest')
  })


  test('every .sdk file on disk survives packing', () => {
    // A package is what npm PUBLISHES, not what the repo holds, and the two
    // differ in ways that no amount of `files` fixes. npm keeps its own
    // always-excluded list, and `.gitignore` is on it: a template file of
    // that name works perfectly from a checkout and is simply absent for
    // everyone who installs from the registry. That is how the site's
    // ignore file shipped as a template and reached nobody.
    //
    // npm is ASKED rather than restated. A copy of npm's exclusion rules
    // here would be a second place to keep them right, and this codebase's
    // recurring defect is precisely the rule written twice.
    const res = spawnSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: ROOT, encoding: 'utf8', shell: true,
    })

    equal(res.status, 0, 'npm pack failed: ' + res.stderr)

    // TWO SHAPES, because npm changed this output: it used to be an ARRAY
    // of package objects and is now an OBJECT KEYED BY PACKAGE NAME. Either
    // is one package here, so take the first entry whichever way it came.
    //
    // The old spelling (`[0].files`) reads `undefined.files` against the new
    // npm and fails with a TypeError that says nothing about packing. CI
    // could not see it — the runner uses the npm bundled with Node 24, which
    // still emits the array — while a developer on npm 12 hit it every run,
    // and so would any publish job that upgrades npm before testing.
    const out = JSON.parse(res.stdout)
    const report: any = Array.isArray(out) ? out[0] : Object.values(out)[0]

    ok(null != report?.files, 'npm pack --json: unrecognised output shape')

    const packed = new Set<string>(report.files.map((f: any) => f.path))

    const tracked = sdkFiles()

    ok(0 < tracked.length, 'no .sdk files found — this cannot pass vacuously')

    const missing = tracked.filter((p: string) => !packed.has(p))

    deepEqual(missing, [],
      'these .sdk files are not in the npm tarball, so an installed ' +
      'package does not have them — generate them from a component ' +
      'instead: ' + missing.join(', '))
  })


  test('the manifest requires an sdkgen that HAS the docs kind', () => {
    // `>=3.4` accepted every published sdkgen, and not one of them could
    // install a docs item: the kind shipped in 3.5.0 (3.4.7 was the last of
    // the 3.4 line to reach the registry — 3.4.8 was never published). A
    // consumer on 3.4.7 got a confusing failure from `package add` instead
    // of the clear refusal `engines` exists to give.
    //
    // 3.5.0 rather than the earlier 3.4.9 floor because the release number is
    // now KNOWN rather than guessed — verified against the published
    // tarballs: 3.5.0 carries dist/action/docs.js, 3.4.7 does not.
    //
    // The npm `peerDependencies` range matches it now. It could not until
    // 3.5.0 existed: npm resolves that range against the registry, so a
    // floor naming an unpublished version fails `npm ci` with ETARGET, for
    // this repo's CI and for anyone installing docgen. `engines` is still
    // the gate that decides an install, because `package add` reads it.
    const [major, minor, patch] =
      String(manifest.engines.sdkgen).replace(/^[^\d]*/, '')
        .split('.').map(Number)

    ok(3 < major || (3 === major && 5 <= minor),
      'engines.sdkgen is ' + manifest.engines.sdkgen +
      ', which admits an sdkgen without the docs kind (needs >=3.5.0)')

    // And the two pins agree. They are read by different things — `engines`
    // by `package add`, the peer range by npm — so they drift silently, and
    // a peer floor BELOW the engines floor is the drift that matters: npm
    // would happily install an sdkgen that `package add` then refuses.
    const pkg = JSON.parse(
      Fs.readFileSync(Path.join(ROOT, 'package.json'), 'utf8'))

    const peer = String(pkg.peerDependencies['@voxgig/sdkgen'])

    equal(peer, '>=' + [major, minor, patch].join('.'),
      'peerDependencies says ' + peer + ' but engines says ' +
      manifest.engines.sdkgen)
  })


  for (const name of manifest.provides.docs) {

    describe('docs item: ' + name, () => {

      test('everything the kind requires is on disk', () => {
        ok(Fs.existsSync(Path.join(SDK, 'model', 'docs', name + '.aontu')),
          'no model file')

        const cmpdir = Path.join(SDK, 'src', 'cmp', 'docs', name)
        ok(Fs.statSync(cmpdir).isDirectory(), 'no component tree')

        // Dispatched by convention: `cmp/docs/<n>/Main_<n>`.
        ok(Fs.existsSync(Path.join(cmpdir, 'Main_' + name + '.ts')),
          'no Main_' + name)
      })


      test('the model file declares its own name', () => {
        // The file is installed and included under its OWN name, so anything
        // it declares under another name is unreachable — the mistake made
        // when an item is copied from another as a starting point.
        //
        // Checked as TEXT, deliberately. COMPILING it is `voxgig-sdkgen
        // package check`'s job, which compiles every model file against the
        // aontu the CONSUMER will use, and reports findings this suite has no
        // vocabulary for. A second compile here would be that rule written
        // twice, with this copy free to drift.
        //
        // The original reason was different and no longer holds: the peer
        // floors were loose enough (`aontu: ">=0"`) that npm resolved 0.28
        // here, whose call semantics differ from the line sdkgen ships, so a
        // compile failed for reasons that were not the author's. The floors
        // are real now and this tree resolves the same aontu sdkgen does.
        const src = Fs.readFileSync(
          Path.join(SDK, 'model', 'docs', name + '.aontu'), 'utf8')

        ok(new RegExp('main: kit: docs: ' + name + ':').test(src),
          'declares no `main: kit: docs: ' + name + ':` block')
      })


      test('the model file keeps the provenance anchor', () => {
        // The anchor is where `docs add` writes where this copy came from.
        // Without it the installed item records nothing, and `package
        // update` can never find its source again.
        const src = Fs.readFileSync(
          Path.join(SDK, 'model', 'docs', name + '.aontu'), 'utf8')

        ok(/^[ \t]*base: 'BASE'[ \t]*$/m.test(src), "no `base: 'BASE'` line")
      })


      test('every setting the model offers is READ by the item', () => {
        // `site.extra` was declared, documented as "appended after the
        // generated ones", and never read by anything: a project that set it
        // got silence, with no way to tell whether its value was wrong or
        // the feature absent. An option that does nothing is worse than an
        // option that is not there.
        //
        // The check is TEXT over the item's own components, which is coarse
        // — it proves the name is mentioned, not that it is honoured. That
        // is the right coarseness for a guard: it cannot pass vacuously (a
        // setting nobody reads has its name nowhere), and when it fails it
        // names the setting.
        const src = Fs.readFileSync(
          Path.join(SDK, 'model', 'docs', name + '.aontu'), 'utf8')

        // The `site:` block's own keys, one indent level in.
        const block = /^\s*site:\s*\{\s*$([\s\S]*?)^\s*\}\s*$/m.exec(src)
        ok(null != block, 'no `site: {` block to check')

        const settings = (block as RegExpExecArray)[1].split('\n')
          .map((line: string) => /^\s{4}([A-Za-z_$][\w$]*):/.exec(line))
          .filter((m) => null != m)
          .map((m) => (m as RegExpExecArray)[1])

        ok(0 < settings.length, 'found no settings — the regex has drifted')

        const cmpdir = Path.join(SDK, 'src', 'cmp', 'docs', name)
        const code = Fs.readdirSync(cmpdir)
          .map((f: string) => Fs.readFileSync(Path.join(cmpdir, f), 'utf8'))
          .join('\n')

        const unread = settings.filter((s: string) =>
          !new RegExp('\\b' + s + '\\b').test(code))

        deepEqual(unread, [],
          'declared in the model and read by nothing: ' + unread.join(', '))
      })


      test('no model file uses a slash comment', () => {
        // aontu takes `#` comments only, and a consumer compiles under a
        // parser configured to reject `//` — the mistake that once shipped
        // seven broken targets in sdkgen itself.
        const src = Fs.readFileSync(
          Path.join(SDK, 'model', 'docs', name + '.aontu'), 'utf8')

        const bad = src.split('\n')
          .map((line, i) => ({ line: i + 1, text: line }))
          .filter(({ text }) =>
            /(^|\s)(\/\/|\/\*)/.test(
              text.replace(/'[^']*'|"[^"]*"/g, '').split('#')[0]))

        deepEqual(bad, [])
      })

    })
  }

})
