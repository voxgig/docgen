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


const ROOT = Path.resolve(__dirname, '..')
const SDK = Path.join(ROOT, '.sdk')

const manifest = JSON.parse(
  Fs.readFileSync(Path.join(ROOT, 'sdkgen-package.json'), 'utf8'))


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
        // package check`'s job, and that is not squeamishness: this package
        // pins no aontu, a consumer compiles with the one SDKGEN ships, and
        // whichever version npm resolves here has different call semantics
        // (0.28 faults on the options shape newer ones require). A compile
        // against the wrong aontu proves nothing about the consumer, and
        // fails for reasons that are not the author's.
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
