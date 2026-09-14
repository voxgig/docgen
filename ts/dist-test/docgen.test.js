"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const docgen_1 = require("../dist/docgen");
const PACKAGE = node_path_1.default.resolve(__dirname, '..');
function model() {
    return { name: 'petstore', origin: 'acme', main: { kit: {
                info: { title: 'Pet API', summary: 'Store and retrieve pet records.', security: { type: 'http', scheme: 'bearer' }, servers: [{ url: 'https://api.example.test' }] },
                target: { ts: { name: 'ts', title: 'TypeScript', active: true, ext: 'ts', module: { name: 'petstore' }, publish: { registry: { active: false, state: 'pending' } } },
                    'go-mcp': { name: 'go-mcp', title: 'MCP server', active: true, module: { name: 'petstore' } } },
                entity: { pet: { name: 'pet', active: true, fields: [{ name: 'id', type: 'number', req: true }],
                        op: { load: { name: 'load', points: [{ method: 'GET', orig: '/pets/{id}', contract: {
                                            json: JSON.stringify({ parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                                                responses: { '200': { description: 'Pet record', content: { 'application/json': { schema: { type: 'object' } } } } } })
                                        } }] } }
                    } },
                feature: { retry: { name: 'retry', title: 'Retry', active: true, config: { options: { active: false } }, hook: { PreFetch: { active: true } } } },
                doc: { edition: { summary: { kind: 'summary', active: true, output: { path: 'SUMMARY.md' } }, 'github-pages': { kind: 'github-pages', active: true, output: { path: 'docs' } } },
                    target: { 'go-mcp': { kind: 'mcp', tool: { petstore_load: { description: 'Load a pet.', input: { type: 'object', properties: { id: { type: 'integer' } } } } } } } }
            } } };
}
function fixture(m = model()) {
    const root = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'docgen-editions-'));
    const write = (p, s) => { const dest = node_path_1.default.join(root, p); node_fs_1.default.mkdirSync(node_path_1.default.dirname(dest), { recursive: true }); node_fs_1.default.writeFileSync(dest, s); };
    for (const [p, s] of Object.entries((0, docgen_1.scaffoldDefaults)()))
        write('.sdk/' + p, s);
    write('.sdk/package.json', '{}');
    for (const [name, e] of Object.entries(m.main.kit.doc.edition)) {
        const from = node_path_1.default.join(PACKAGE, 'project/.sdk/tm/edition', e.kind);
        node_fs_1.default.cpSync(from, node_path_1.default.join(root, '.sdk/tm/edition', name), { recursive: true });
        write('.sdk/dist/cmp/edition/' + name + '/Main_' + name + '.js', 'exports.Main=require(' + JSON.stringify(node_path_1.default.join(PACKAGE, 'dist/docgen.js')) + ').renderEdition');
    }
    return { root, m, write, read: (p) => node_fs_1.default.readFileSync(node_path_1.default.join(root, p), 'utf8'), clean: () => node_fs_1.default.rmSync(root, { recursive: true, force: true }) };
}
(0, node_test_1.test)('default scaffold contains summary and Pages, without Slidev', () => {
    const files = (0, docgen_1.scaffoldDefaults)();
    strict_1.default.ok(files['model/edition/summary.aon']);
    strict_1.default.ok(files['model/edition/github-pages.aon']);
    strict_1.default.ok(!Object.keys(files).some(p => p.includes('presentation')));
});
(0, node_test_1.test)('all editions render model content; site links resolve and output is deterministic', async () => {
    const m = model();
    m.main.kit.doc.edition.presentation = { kind: 'presentation', active: true, output: { path: 'presentation' } };
    const f = fixture(m);
    try {
        f.write('.sdk/doc/content/start.md', '# Start\n\nRead the [details](nested/details.md).\n');
        f.write('.sdk/doc/content/nested/details.md', '# Details\n\nRead the [start](../start.md).\n');
        const first = await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.equal(first.editions.length, 3);
        strict_1.default.match(f.read('SUMMARY.md'), /TypeScript/);
        strict_1.default.match(f.read('docs/api/pet.html'), /Parameters/);
        strict_1.default.match(f.read('docs/api/pet.html'), /Responses/);
        strict_1.default.match(f.read('docs/tools/go-mcp.html'), /petstore_load/);
        strict_1.default.match(f.read('docs/features/retry.html'), /PreFetch/);
        strict_1.default.match(f.read('presentation/slides.md'), /provider: none/);
        for (const p of first.files.filter(p => p.endsWith('.html'))) {
            const html = f.read(p);
            for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
                const url = match[1].split('#')[0];
                if (!url || /^[a-z]+:/i.test(url))
                    continue;
                strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.resolve(f.root, node_path_1.default.dirname(p), url)), p + ' broken link ' + url);
            }
        }
        const before = f.read('docs/index.html');
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.equal(f.read('docs/index.html'), before);
        const qa = JSON.parse(f.read('.sdk/doc/qa-manifest.json'));
        strict_1.default.ok(qa.files.includes('presentation/slides.md'));
        strict_1.default.ok(qa.files.includes('SUMMARY.md'));
        strict_1.default.ok(qa.files.includes('docs/additional/start.html'));
        strict_1.default.match(f.read('.github/workflows/docgen.yml'), /needs: check/);
        strict_1.default.match(f.read('.github/workflows/docgen.yml'), /voxgig-docgen generate \.\./);
        strict_1.default.doesNotMatch(f.read('.github/workflows/docgen.yml'), /npm run generate|voxgig-model/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('filters, aliases, and per-edition styles are independent', async () => {
    const m = model();
    m.main.kit.doc.style = { color: { primary: '#123456' }, font: 'Arial' };
    m.main.kit.doc.edition.summary.filter = { targets: ['ts'] };
    m.main.kit.doc.edition.portal = { kind: 'github-pages', active: true, output: { path: 'portal' }, style: { color: { primary: '#abcdef' } } };
    m.main.kit.doc.ci = { active: false };
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.doesNotMatch(f.read('SUMMARY.md'), /MCP server/);
        strict_1.default.match(f.read('docs/assets/style.css'), /#123456/);
        strict_1.default.match(f.read('portal/assets/style.css'), /#abcdef/);
        strict_1.default.match(f.read('portal/assets/style.css'), /Arial/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('preflight refuses unsafe and overlapping output paths', async () => {
    for (const path of ['../escape', '.sdk', '.git', '.github', '.sdk/model', 'ts', 'docs']) {
        const m = model();
        m.main.kit.doc.edition.summary.output.path = path;
        const f = fixture(m);
        try {
            await strict_1.default.rejects((0, docgen_1.generate)({ folder: f.root, model: m }));
            strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(f.root, 'docs/index.html')));
        }
        finally {
            f.clean();
        }
    }
});
(0, node_test_1.test)('dry run writes nothing and stale owned pages are removed', async () => {
    const f = fixture();
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: f.m, control: { dryrun: true } });
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(f.root, 'docs')));
        await (0, docgen_1.generate)({ folder: f.root, model: f.m });
        f.write('docs/handwritten.txt', 'keep');
        f.m.main.kit.entity.pet.active = false;
        await (0, docgen_1.generate)({ folder: f.root, model: f.m });
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(f.root, 'docs/api/pet.html')));
        strict_1.default.equal(f.read('docs/handwritten.txt'), 'keep');
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('model prose cannot execute HTML or Vue expressions', async () => {
    const m = model();
    m.main.kit.info.summary = '<script>alert(1)</script> {{ execute() }}';
    m.main.kit.doc.edition.presentation = { kind: 'presentation', active: true, output: { path: 'presentation' } };
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.doesNotMatch(f.read('docs/index.html'), /<script>alert/);
        strict_1.default.doesNotMatch(f.read('presentation/slides.md'), /\{\{ execute/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('text QA gates Markdown, rendered HTML, and Slidev prose but excludes code', () => {
    strict_1.default.ok((0, docgen_1.checkText)('A seamless\nintegration.').length);
    strict_1.default.ok((0, docgen_1.checkText)('<main>A seamless integration.</main>', 'html').length);
    strict_1.default.ok((0, docgen_1.checkText)('---\ntheme: none\n---\n# A seamless integration').length);
    strict_1.default.equal((0, docgen_1.checkText)('Use `seamless` as an identifier.\n```ts\nconst seamless = true\n```').length, 0);
    strict_1.default.equal((0, docgen_1.checkText)('<main>Use the identifier.<pre>seamless</pre></main>', 'html').length, 0);
    strict_1.default.ok((0, docgen_1.checkText)('We make requests.').length);
    strict_1.default.ok((0, docgen_1.checkText)('One — two.').length);
    strict_1.default.equal((0, docgen_1.proseText)('<p>A &amp; B</p>', 'html'), 'A & B');
});
(0, node_test_1.test)('model schema compiles with all three editions and shared style overrides', () => {
    const { Aontu } = require('aontu');
    const source = node_fs_1.default.readFileSync(node_path_1.default.join(PACKAGE, 'model/docgen.aon'), 'utf8') + '\nmain: kit: doc: style: color: primary: "#123456"\nmain: kit: doc: edition: summary: {kind: "summary", active:true, output:path:"SUMMARY.md"}';
    const all = source + '\nmain: kit: doc: edition: {presentation: {kind: \"presentation\", output:path:\"presentation\"}, \"github-pages\": {kind:\"github-pages\", output:path:\"docs\"}}';
    const out = new Aontu().generate(all, { path: node_path_1.default.join(PACKAGE, 'model/docgen.aon') });
    strict_1.default.equal(out.main.kit.doc.edition.summary.output.path, 'SUMMARY.md');
    strict_1.default.equal(out.main.kit.doc.style.color.primary, '#123456');
    strict_1.default.equal(Object.keys(out.main.kit.doc.edition).length, 3);
    strict_1.default.throws(() => new Aontu().generate(all + '\nmain: kit: doc: edition: invalid: {kind: \"summary\", active: \"wrong type\", output:path:\"invalid.md\"}', { path: node_path_1.default.join(PACKAGE, 'model/docgen.aon') }));
});
(0, node_test_1.test)('package manifest and shipped edition trees agree', () => {
    const manifest = require('../project/sdkgen-package.json');
    strict_1.default.deepEqual(manifest.provides.edition, ['summary', 'github-pages', 'presentation']);
    for (const name of manifest.provides.edition)
        strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(PACKAGE, 'project/.sdk/src/cmp/edition', name, 'Main_' + name + '.ts')));
    const packed = (0, node_child_process_1.spawnSync)('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: PACKAGE, shell: process.platform === 'win32', encoding: 'utf8', env: { ...process.env, npm_config_cache: node_path_1.default.join(node_os_1.default.tmpdir(), 'docgen-npm-cache') } });
    strict_1.default.equal(packed.status, 0, packed.stderr);
    const json = JSON.parse(packed.stdout), entry = Array.isArray(json) ? json[0] : Object.values(json)[0];
    const paths = entry.files.map((f) => f.path);
    strict_1.default.ok(!paths.some((path) => path.startsWith('.sdk/') || path === 'sdkgen-package.json'));
    strict_1.default.equal(manifest.version, require('../package.json').version);
    for (const path of ['qa/vale.ini', 'qa/styles/config/vocabularies/Docgen/reject.txt', 'model/docgen.aon', 'bin/voxgig-docgen', 'README.md', 'LICENSE', 'project/sdkgen-package.json', 'project/.sdk/tm/edition/github-pages/page.html', 'assets/nunito.woff2', 'assets/nunito.woff2.license.txt', 'admin/setup-github-pages.sh', 'dist/admin/github-pages.js'])
        strict_1.default.ok(paths.includes(path), path);
});
(0, node_test_1.test)('project bootstrap installs defaults once and preserves customised templates', () => {
    const root = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'docgen-bootstrap-'));
    try {
        node_fs_1.default.mkdirSync(node_path_1.default.join(root, '.sdk/model'), { recursive: true });
        node_fs_1.default.writeFileSync(node_path_1.default.join(root, '.sdk/model/sdk.aon'), 'main: kit: {}\n');
        (0, docgen_1.prepareProject)(root);
        const file = node_path_1.default.join(root, '.sdk/tm/edition/github-pages/page.html');
        strict_1.default.ok(node_fs_1.default.existsSync(file));
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(root, '.sdk/model/edition/presentation.aon')));
        node_fs_1.default.writeFileSync(file, 'custom page');
        (0, docgen_1.prepareProject)(root);
        strict_1.default.equal(node_fs_1.default.readFileSync(file, 'utf8'), 'custom page');
        strict_1.default.equal(node_fs_1.default.readFileSync(node_path_1.default.join(root, '.sdk/model/sdk.aon'), 'utf8').split('edition-index.aon').length, 2);
    }
    finally {
        node_fs_1.default.rmSync(root, { recursive: true, force: true });
    }
});
(0, node_test_1.test)('local branding assets retain their bytes in the website and presentation', async () => {
    const m = model();
    m.main.kit.doc.style = { logo: 'logo.png', fontFile: 'brand.woff2' };
    m.main.kit.doc.edition.presentation = { kind: 'presentation', active: true, output: { path: 'presentation' } };
    const f = fixture(m), bytes = Buffer.from([0, 1, 127, 128, 255]);
    try {
        node_fs_1.default.mkdirSync(node_path_1.default.join(f.root, '.sdk/doc/assets'), { recursive: true });
        for (const file of ['logo.png', 'brand.woff2'])
            node_fs_1.default.writeFileSync(node_path_1.default.join(f.root, '.sdk/doc/assets', file), bytes);
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.deepEqual(node_fs_1.default.readFileSync(node_path_1.default.join(f.root, 'docs/assets/logo.png')), bytes);
        strict_1.default.deepEqual(node_fs_1.default.readFileSync(node_path_1.default.join(f.root, 'presentation/assets/font.woff2')), bytes);
        strict_1.default.match(f.read('presentation/global-top.vue'), /logo.png/);
        strict_1.default.match(f.read('docs/assets/style.css'), /DocgenLocal/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('SDK defaults and MCP capability limits reflect the model', async () => {
    const m = model();
    delete m.main.kit.doc.target['go-mcp'].tool;
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.match(f.read('docs/sdks/ts.html'), /https:\/\/api.example.test/);
        strict_1.default.match(f.read('docs/sdks/ts.html'), /Bearer/);
        const mcp = f.read('docs/tools/go-mcp.html');
        strict_1.default.match(mcp, /no active entity supports <code>list<\/code>/);
        strict_1.default.match(mcp, /Supported entities: <code>pet<\/code>/);
        strict_1.default.doesNotMatch(mcp, /&quot;enum&quot;: \[\]/);
        strict_1.default.match(mcp, /<details open><summary>Tools<\/summary>/);
        strict_1.default.equal((0, docgen_1.checkText)(f.read('docs/index.html'), 'html').length, 0);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('Pages staging excludes project-owned notes and stale output', async () => {
    const { stageSite } = require('../dist/docgen');
    const f = fixture();
    let artifact = '';
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: f.m });
        f.write('.sdk/model/sdk.json', JSON.stringify(f.m));
        f.write('docs/reviews/private-note.md', 'Internal review');
        f.write('docs/old.html', 'Retired page');
        artifact = stageSite(f.root, 'github-pages');
        strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(artifact, 'index.html')));
        strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(artifact, '.nojekyll')));
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(artifact, 'reviews')));
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(artifact, 'old.html')));
        strict_1.default.match(f.read('.github/workflows/docgen.yml'), /steps.site.outputs.path/);
        node_fs_1.default.unlinkSync(node_path_1.default.join(f.root, 'docs/api/pet.html'));
        strict_1.default.throws(() => stageSite(f.root, 'github-pages'));
    }
    finally {
        f.clean();
        if (artifact)
            node_fs_1.default.rmSync(artifact, { recursive: true, force: true });
    }
});
(0, node_test_1.test)('summary orients readers and links from a nested output location', async () => {
    const m = model();
    m.main.kit.info.description = 'Store pet records and retrieve the current catalogue.';
    m.main.kit.entity.pet.op.list = { name: 'list', points: [{ method: 'GET', orig: '/pets', contract: { json: JSON.stringify({ security: [], responses: { 200: { description: 'Pet records' } } }) } }] };
    m.main.kit.doc.edition.summary.output.path = 'overview/SUMMARY.md';
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        const text = f.read('overview/SUMMARY.md');
        strict_1.default.match(text, /Store pet records and retrieve the current catalogue/);
        strict_1.default.match(text, /curl --fail-with-body --silent --show-error 'https:\/\/api.example.test\/pets'/);
        strict_1.default.match(text, /\.\.\/docs\/api\/pet.html/);
        strict_1.default.match(text, /Choose an SDK/);
        strict_1.default.match(text, /Operational features/);
        strict_1.default.doesNotMatch(text, /curl[^\n]*\{id\}/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('summary does not invent anonymous examples or reference an inactive site', async () => {
    const m = model();
    m.main.kit.doc.edition['github-pages'].active = false;
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.doesNotMatch(f.read('SUMMARY.md'), /curl --|\]\(docs\//);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('the website links back to the SDK repository, declared or derived', async () => {
    // Derived: no `repo` declared, so `<origin>/<name>-sdk` under github.com —
    // the same rule sdkgen uses for go.mod and the package manifests.
    const m = model();
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.match(f.read('docs/index.html'), /class="repo-link" href="https:\/\/github.com\/acme\/petstore-sdk">acme\/petstore-sdk<\/a>/);
        // Every page carries it, not just the index — a reader deep in the
        // reference must be able to get back to the source.
        strict_1.default.match(f.read('docs/api/index.html'), /class="repo-link" href="https:\/\/github.com\/acme\/petstore-sdk"/);
    }
    finally {
        f.clean();
    }
    // Declared: a repo that is not `<origin>/<name>-sdk` says so, and the link
    // follows. This is the case the derivation gets wrong on its own.
    const m2 = model();
    m2.main.kit.repo = { path: 'acme/legacy-client-sdk', host: 'gitlab.example' };
    const f2 = fixture(m2);
    try {
        await (0, docgen_1.generate)({ folder: f2.root, model: m2 });
        strict_1.default.match(f2.read('docs/index.html'), /class="repo-link" href="https:\/\/gitlab.example\/acme\/legacy-client-sdk">acme\/legacy-client-sdk<\/a>/);
        strict_1.default.doesNotMatch(f2.read('docs/index.html'), /petstore-sdk/);
    }
    finally {
        f2.clean();
    }
});
(0, node_test_1.test)('branding, local typography, and a logo-free slide frame survive generation', async () => {
    const m = model();
    m.main.kit.doc.brand = { url: 'https://example.test', label: 'example.test', notice: 'Unofficial SDK. Generated by [Voxgig](https://voxgig.com/). No affiliation with the API provider.', shortNotice: 'Unofficial SDK. {{ literal }}' };
    m.main.kit.doc.style = { mode: 'dark', color: { primary: '#49d49e', darkBackground: '#0e1615', darkText: '#f3f0ec' }, fontFile: 'body.woff2', headingFontFile: 'heading.woff2', monoFile: 'mono.woff2' };
    m.main.kit.doc.edition.presentation = { kind: 'presentation', active: true, output: { path: 'presentation' } };
    const f = fixture(m);
    try {
        for (const name of ['body', 'heading', 'mono']) {
            f.write('.sdk/doc/assets/' + name + '.woff2', 'font fixture');
            f.write('.sdk/doc/assets/' + name + '.woff2.license.txt', 'Font license');
        }
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.match(f.read('docs/index.html'), /class="provider-link" href="https:\/\/example.test"/);
        strict_1.default.match(f.read('docs/index.html'), /Unofficial SDK/);
        strict_1.default.match(f.read('docs/index.html'), /Generated by <a href="https:\/\/voxgig.com\/">Voxgig<\/a>/);
        strict_1.default.match(f.read('SUMMARY.md'), /Unofficial SDK/);
        strict_1.default.match(f.read('presentation/slides.md'), /colorSchema: dark/);
        strict_1.default.match(f.read('presentation/global-top.vue'), /docgen-frame/);
        strict_1.default.match(f.read('presentation/global-top.vue'), /\$page/);
        strict_1.default.match(f.read('presentation/global-top.vue'), /v-pre>Unofficial SDK. \{\{ literal \}\}/);
        strict_1.default.doesNotMatch(f.read('presentation/global-top.vue'), /<img/);
        strict_1.default.match(f.read('presentation/assets/style.css'), /DocgenHeading/);
        strict_1.default.equal(f.read('docs/assets/heading-font.woff2.license.txt'), 'Font license');
        strict_1.default.equal(f.read('presentation/public/assets/heading-font.woff2.license.txt'), 'Font license');
        strict_1.default.ok(JSON.parse(f.read('.sdk/doc/qa-manifest.json')).files.includes('presentation/global-top.vue'));
        strict_1.default.ok((0, docgen_1.checkText)('<template><footer>This is seamless.</footer></template>', 'vue').length);
        m.main.kit.doc.brand.url = 'javascript:alert(1)';
        await strict_1.default.rejects((0, docgen_1.generate)({ folder: f.root, model: m }), /must use HTTP/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('Voxgig defaults and project themes are independent in all visual editions', async () => {
    const m = model();
    m.main.kit.doc.edition.presentation = { kind: 'presentation', active: true, output: { path: 'presentation' } };
    const f = fixture(m);
    try {
        const defaults = (0, docgen_1.styleFor)(m, {});
        strict_1.default.equal(defaults.mode, 'light');
        strict_1.default.equal(defaults.color.primary, '#e70042');
        const { Aontu } = require('aontu');
        const schema = new Aontu().generate(node_fs_1.default.readFileSync(node_path_1.default.join(PACKAGE, 'model/docgen.aon'), 'utf8'));
        strict_1.default.deepEqual(schema.main.kit.doc.style.color, defaults.color);
        strict_1.default.equal(schema.main.kit.doc.style.font, defaults.font);
        strict_1.default.equal(schema.main.kit.doc.style.mode, defaults.mode);
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        for (const prefix of ['docs', 'presentation']) {
            strict_1.default.match(f.read(prefix + '/assets/style.css'), /--primary:#e70042;--accent:#00c6d8;--background:#f5f5f9;--text:#0a0a0a/);
            strict_1.default.match(f.read(prefix + '/assets/style.css'), /font-family:Nunito/);
            strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(f.root, prefix, 'assets/nunito.woff2')));
        }
        strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(f.root, 'presentation/public/assets/nunito.woff2.license.txt')));
        strict_1.default.doesNotMatch(f.read('docs/index.html'), /univec.ai/);
        m.main.kit.doc.style = { mode: 'dark', font: 'Arial', headingFont: 'Arial', color: { primary: '#49d4a1', accent: '#f7bc45', darkBackground: '#0e1615', darkText: '#f3f1ec' } };
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        for (const prefix of ['docs', 'presentation']) {
            strict_1.default.match(f.read(prefix + '/assets/style.css'), /--primary:#49d4a1/);
            strict_1.default.match(f.read(prefix + '/assets/style.css'), /--background:#0e1615;--text:#f3f1ec/);
            strict_1.default.doesNotMatch(f.read(prefix + '/assets/style.css'), /Nunito|#e70042/);
            strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(f.root, prefix, 'assets/nunito.woff2')));
        }
        strict_1.default.equal((0, docgen_1.styleFor)(model(), {}).color.primary, '#e70042');
        strict_1.default.equal((0, docgen_1.styleFor)(m, { style: { color: { primary: '#123456' } } }).color.primary, '#123456');
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('Pages admin script is generated with executable permissions and removed when Pages is disabled', async () => {
    const m = model(), f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m, control: { dryrun: true } });
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(f.root, '.sdk/admin/setup-github-pages.sh')));
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        const file = node_path_1.default.join(f.root, '.sdk/admin/setup-github-pages.sh');
        strict_1.default.match(f.read('.sdk/admin/setup-github-pages.sh'), /docgen\/dist\/admin\/github-pages.js/);
        if (process.platform !== 'win32')
            strict_1.default.ok(node_fs_1.default.statSync(file).mode & 0o111);
        f.write('.sdk/admin/status.sh', '# status belongs to the scaffold\n');
        f.write('.sdk/admin/custom.sh', '# project script\n');
        m.main.kit.doc.edition['github-pages'].active = false;
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.ok(!node_fs_1.default.existsSync(file));
        strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(f.root, '.sdk/admin/status.sh')));
        strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(f.root, '.sdk/admin/custom.sh')));
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('nested Slidev presentation stages built assets without its source or dependencies', async () => {
    const { stageSite, runQA } = require('../dist/docgen');
    const m = model();
    m.main.kit.doc.edition.deck = { kind: 'presentation', output: { path: 'docs/slidev' } };
    const f = fixture(m);
    let artifact = '';
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        f.write('.sdk/model/sdk.json', JSON.stringify(m));
        strict_1.default.match(f.read('docs/index.html'), /href="slidev\/index.html"/);
        strict_1.default.match(f.read('docs/api/pet.html'), /href="..\/slidev\/index.html"/);
        strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(f.root, 'docs/slidev/uno.config.ts')));
        strict_1.default.throws(() => stageSite(f.root, 'github-pages'), /Build presentation deck/);
        strict_1.default.ok(runQA('.sdk/doc/qa-manifest.json', f.root, false).errors.some((error) => error.includes('broken local link')));
        f.write('docs/slidev/dist/index.html', '<h1>Built slides</h1>');
        f.write('docs/slidev/dist/assets/deck.js', 'console.log("deck")');
        strict_1.default.deepEqual(runQA('.sdk/doc/qa-manifest.json', f.root, false).errors, []);
        f.write('docs/slidev/node_modules/private.txt', 'dependency');
        f.write('docs/reviews/notes.md', 'review notes');
        artifact = stageSite(f.root, 'github-pages');
        strict_1.default.equal(node_fs_1.default.readFileSync(node_path_1.default.join(artifact, 'slidev/index.html'), 'utf8'), '<h1>Built slides</h1>');
        strict_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(artifact, 'slidev/assets/deck.js')));
        for (const name of ['slides.md', 'package.json', 'uno.config.ts', 'node_modules', 'dist']) {
            strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(artifact, 'slidev', name)), name + ' leaked into Pages');
        }
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(artifact, 'reviews')));
        node_fs_1.default.rmSync(artifact, { recursive: true });
        artifact = '';
        m.main.kit.doc.edition.deck.site = { active: false };
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        f.write('.sdk/model/sdk.json', JSON.stringify(m));
        strict_1.default.doesNotMatch(f.read('docs/index.html'), /class="presentation-link"/);
        artifact = stageSite(f.root, 'github-pages');
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(artifact, 'slidev')));
    }
    finally {
        f.clean();
        if (artifact)
            node_fs_1.default.rmSync(artifact, { recursive: true, force: true });
    }
});
(0, node_test_1.test)('nested edition paths still reject file and directory collisions', async () => {
    const m = model();
    m.main.kit.doc.edition.presentation = { kind: 'presentation', output: { path: 'docs/api/index.html' } };
    const f = fixture(m);
    try {
        await strict_1.default.rejects((0, docgen_1.generate)({ folder: f.root, model: m }), /overlaps presentation|Duplicate edition output/);
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(f.root, 'docs/index.html')));
    }
    finally {
        f.clean();
    }
});
//# sourceMappingURL=docgen.test.js.map