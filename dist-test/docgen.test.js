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
const ROOT = node_path_1.default.resolve(__dirname, '..');
const SDK = node_path_1.default.join(ROOT, '.sdk');
const manifest = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(ROOT, 'sdkgen-package.json'), 'utf8'));
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