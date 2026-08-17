"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = require("node:assert");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const ROOT = node_path_1.default.resolve(__dirname, '..');
const SDK = node_path_1.default.join(ROOT, '.sdk');
const manifest = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(ROOT, 'sdkgen-package.json'), 'utf8'));
// Every COMMITTED file under `.sdk`, as tarball-style relative paths.
//
// Tracked rather than "whatever is on disk": an untracked local file is not
// part of the package, and demanding npm ship one would be a red build for
// somebody's scratch file.
function sdkFiles() {
    const res = (0, node_child_process_1.spawnSync)('git', ['ls-files', '.sdk'], {
        cwd: ROOT, encoding: 'utf8',
    });
    (0, node_assert_1.equal)(res.status, 0, 'git ls-files failed: ' + res.stderr);
    return res.stdout.split('\n').filter((p) => '' !== p).sort();
}
(0, node_test_1.describe)('sdkgen package', () => {
    (0, node_test_1.test)('the manifest declares a package of the schema sdkgen knows', () => {
        (0, node_assert_1.equal)(manifest.sdkgen.package, 1);
        (0, node_assert_1.equal)(manifest.name, '@voxgig/docgen');
        (0, node_assert_1.ok)(null != manifest.provides.docs, 'no docs items provided');
    });
    (0, node_test_1.test)('the manifest version matches package.json', () => {
        // `package list` shows the MANIFEST's version, and `package update`
        // compares against the source on disk — so two versions that disagree
        // make a consumer's report a lie.
        const pkg = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(ROOT, 'package.json'), 'utf8'));
        (0, node_assert_1.equal)(manifest.version, pkg.version);
    });
    (0, node_test_1.test)('npm ships the package content', () => {
        // A manifest npm does not publish makes an installed package that
        // `package add` refuses.
        const pkg = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(ROOT, 'package.json'), 'utf8'));
        (0, node_assert_1.ok)(pkg.files.includes('.sdk'), 'files omits .sdk');
        (0, node_assert_1.ok)(pkg.files.includes('sdkgen-package.json'), 'files omits the manifest');
    });
    (0, node_test_1.test)('every .sdk file on disk survives packing', () => {
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
        const res = (0, node_child_process_1.spawnSync)('npm', ['pack', '--dry-run', '--json'], {
            cwd: ROOT, encoding: 'utf8', shell: true,
        });
        (0, node_assert_1.equal)(res.status, 0, 'npm pack failed: ' + res.stderr);
        const packed = new Set(JSON.parse(res.stdout)[0].files.map((f) => f.path));
        const tracked = sdkFiles();
        (0, node_assert_1.ok)(0 < tracked.length, 'no .sdk files found — this cannot pass vacuously');
        const missing = tracked.filter((p) => !packed.has(p));
        (0, node_assert_1.deepEqual)(missing, [], 'these .sdk files are not in the npm tarball, so an installed ' +
            'package does not have them — generate them from a component ' +
            'instead: ' + missing.join(', '));
    });
    (0, node_test_1.test)('the manifest requires an sdkgen that HAS the docs kind', () => {
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
        const [major, minor, patch] = String(manifest.engines.sdkgen).replace(/^[^\d]*/, '')
            .split('.').map(Number);
        (0, node_assert_1.ok)(3 < major || (3 === major && 5 <= minor), 'engines.sdkgen is ' + manifest.engines.sdkgen +
            ', which admits an sdkgen without the docs kind (needs >=3.5.0)');
        // And the two pins agree. They are read by different things — `engines`
        // by `package add`, the peer range by npm — so they drift silently, and
        // a peer floor BELOW the engines floor is the drift that matters: npm
        // would happily install an sdkgen that `package add` then refuses.
        const pkg = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(ROOT, 'package.json'), 'utf8'));
        const peer = String(pkg.peerDependencies['@voxgig/sdkgen']);
        (0, node_assert_1.equal)(peer, '>=' + [major, minor, patch].join('.'), 'peerDependencies says ' + peer + ' but engines says ' +
            manifest.engines.sdkgen);
    });
    for (const name of manifest.provides.docs) {
        (0, node_test_1.describe)('docs item: ' + name, () => {
            (0, node_test_1.test)('everything the kind requires is on disk', () => {
                (0, node_assert_1.ok)(node_fs_1.default.existsSync(node_path_1.default.join(SDK, 'model', 'docs', name + '.aontu')), 'no model file');
                const cmpdir = node_path_1.default.join(SDK, 'src', 'cmp', 'docs', name);
                (0, node_assert_1.ok)(node_fs_1.default.statSync(cmpdir).isDirectory(), 'no component tree');
                // Dispatched by convention: `cmp/docs/<n>/Main_<n>`.
                (0, node_assert_1.ok)(node_fs_1.default.existsSync(node_path_1.default.join(cmpdir, 'Main_' + name + '.ts')), 'no Main_' + name);
            });
            (0, node_test_1.test)('the model file declares its own name', () => {
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
                const src = node_fs_1.default.readFileSync(node_path_1.default.join(SDK, 'model', 'docs', name + '.aontu'), 'utf8');
                (0, node_assert_1.ok)(new RegExp('main: kit: docs: ' + name + ':').test(src), 'declares no `main: kit: docs: ' + name + ':` block');
            });
            (0, node_test_1.test)('the model file keeps the provenance anchor', () => {
                // The anchor is where `docs add` writes where this copy came from.
                // Without it the installed item records nothing, and `package
                // update` can never find its source again.
                const src = node_fs_1.default.readFileSync(node_path_1.default.join(SDK, 'model', 'docs', name + '.aontu'), 'utf8');
                (0, node_assert_1.ok)(/^[ \t]*base: 'BASE'[ \t]*$/m.test(src), "no `base: 'BASE'` line");
            });
            (0, node_test_1.test)('every setting the model offers is READ by the item', () => {
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
                const src = node_fs_1.default.readFileSync(node_path_1.default.join(SDK, 'model', 'docs', name + '.aontu'), 'utf8');
                // The `site:` block's own keys, one indent level in.
                const block = /^\s*site:\s*\{\s*$([\s\S]*?)^\s*\}\s*$/m.exec(src);
                (0, node_assert_1.ok)(null != block, 'no `site: {` block to check');
                const settings = block[1].split('\n')
                    .map((line) => /^\s{4}([A-Za-z_$][\w$]*):/.exec(line))
                    .filter((m) => null != m)
                    .map((m) => m[1]);
                (0, node_assert_1.ok)(0 < settings.length, 'found no settings — the regex has drifted');
                const cmpdir = node_path_1.default.join(SDK, 'src', 'cmp', 'docs', name);
                const code = node_fs_1.default.readdirSync(cmpdir)
                    .map((f) => node_fs_1.default.readFileSync(node_path_1.default.join(cmpdir, f), 'utf8'))
                    .join('\n');
                const unread = settings.filter((s) => !new RegExp('\\b' + s + '\\b').test(code));
                (0, node_assert_1.deepEqual)(unread, [], 'declared in the model and read by nothing: ' + unread.join(', '));
            });
            (0, node_test_1.test)('no model file uses a slash comment', () => {
                // aontu takes `#` comments only, and a consumer compiles under a
                // parser configured to reject `//` — the mistake that once shipped
                // seven broken targets in sdkgen itself.
                const src = node_fs_1.default.readFileSync(node_path_1.default.join(SDK, 'model', 'docs', name + '.aontu'), 'utf8');
                const bad = src.split('\n')
                    .map((line, i) => ({ line: i + 1, text: line }))
                    .filter(({ text }) => /(^|\s)(\/\/|\/\*)/.test(text.replace(/'[^']*'|"[^"]*"/g, '').split('#')[0]));
                (0, node_assert_1.deepEqual)(bad, []);
            });
        });
    }
});
//# sourceMappingURL=docgen.test.js.map