#!/usr/bin/env node

// Stamp the release version everywhere it is DUPLICATED, from the one place
// that owns it: package.json.
//
// docgen is itself an sdkgen package, so it carries a second version — the
// one in sdkgen-package.json, which `package list` displays and `package
// update` compares against the source on disk. The two ship as a single npm
// artifact, so they are the same number by definition, and a release that
// leaves them disagreeing tells every consumer it is out of date, or worse
// that it is not.
//
// Stamped rather than hand-edited for that reason. `test/docgen.test.ts` pins
// the equality, so a forgotten bump fails the suite rather than the registry
// — but only once someone has already had to notice; this makes it one
// command, run by `repo-publish-quick` before the build. Modelled on sdkgen's
// build/version.js, which does the same for its own manifest and for the
// version embedded in its bin script (docgen has no bin, so the manifest is
// the whole job here).
//
// The version LINE is rewritten, rather than the file being re-serialised
// from the parsed object: `sdkgen-package.json` is hand-formatted (one-line
// objects and arrays that JSON.stringify would explode), and a release commit
// should show the version changing, not the whole manifest reflowing.

const fs = require('fs')
const path = require('path')

const packageJsonPath = path.join(__dirname, '..', 'package.json')
const version = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version

const manifestPath = path.join(__dirname, '..', 'sdkgen-package.json')
const src = fs.readFileSync(manifestPath, 'utf8')

const VERSION_RE = /("version"\s*:\s*)"[^"]*"/

if (!VERSION_RE.test(src)) {
  console.error('Error: no "version" field found in', manifestPath)
  process.exit(1)
}

const out = src.replace(VERSION_RE, '$1"' + version + '"')

// A substitution against hand-written text is fragile by nature — if the
// manifest is ever reformatted past what the pattern matches, the replace
// silently does nothing and the release ships the previous number. Check the
// result rather than trust it.
if (version !== JSON.parse(out).version) {
  console.error('Error: version stamp did not take in', manifestPath)
  process.exit(1)
}

if (out !== src) {
  fs.writeFileSync(manifestPath, out, 'utf8')
  console.log('sdkgen-package.json -> ' + version)
}
else {
  console.log('sdkgen-package.json already ' + version)
}
