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
const definitions = new WeakMap();
function model() {
    const m = { name: 'petstore', def: 'petstore.json', origin: 'acme', main: { kit: {
                info: { title: 'Pet API', summary: 'Store and retrieve pet records.', security: { type: 'http', scheme: 'bearer' }, servers: [{ url: 'https://api.example.test' }] },
                target: { ts: { name: 'ts', title: 'TypeScript', active: true, ext: 'ts', module: { name: 'petstore' }, publish: { registry: { active: false, state: 'pending' } } },
                    'go-mcp': { name: 'go-mcp', title: 'MCP server', active: true, module: { name: 'petstore' } } },
                entity: { pet: { name: 'pet', active: true,
                        fields: { id: { n: 'id', h: 'Id', t: 'number', r: true } },
                        op: { load: { name: 'load', points: [{ m: 'GET', o: '/pets/{id}', s: [{ lit: 'pets' }, { var: 'id' }] }] } }
                    } },
                feature: { retry: { name: 'retry', title: 'Retry', active: true, config: { options: { active: false } }, hook: { PreFetch: { active: true } } } },
                doc: { edition: { summary: { kind: 'summary', active: true, output: { path: 'SUMMARY.md' } }, 'github-pages': { kind: 'github-pages', active: true, output: { path: 'docs' } } },
                    target: { 'go-mcp': { kind: 'mcp', tool: { petstore_load: { description: 'Load a pet.', input: { type: 'object', properties: { id: { type: 'integer' } } } } } } } }
            } } };
    definitions.set(m, { openapi: '3.0.3', info: { title: 'Pet API', version: '1' }, paths: {
            '/pets/{id}': { get: {
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                    responses: { '200': { description: 'Pet record', content: { 'application/json': { schema: { type: 'object' } } } } },
                } },
        } });
    return m;
}
function fixture(m = model()) {
    const root = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'docgen-editions-'));
    const write = (p, s) => { const dest = node_path_1.default.join(root, p); node_fs_1.default.mkdirSync(node_path_1.default.dirname(dest), { recursive: true }); node_fs_1.default.writeFileSync(dest, s); };
    for (const [p, s] of Object.entries((0, docgen_1.scaffoldDefaults)()))
        write('.sdk/' + p, s);
    write('.sdk/package.json', '{}');
    write('.sdk/def/' + m.def, JSON.stringify(definitions.get(m)));
    const apidef = node_path_1.default.dirname(require.resolve('@voxgig/apidef/package.json'));
    node_fs_1.default.mkdirSync(node_path_1.default.join(root, '.sdk/node_modules/@voxgig'), { recursive: true });
    node_fs_1.default.symlinkSync(apidef, node_path_1.default.join(root, '.sdk/node_modules/@voxgig/apidef'), 'dir');
    for (const [name, e] of Object.entries(m.main.kit.doc.edition)) {
        const from = node_path_1.default.join(PACKAGE, 'project/.sdk/tm/edition', e.kind);
        node_fs_1.default.cpSync(from, node_path_1.default.join(root, '.sdk/tm/edition', name), { recursive: true });
        write('.sdk/dist/cmp/edition/' + name + '/Main_' + name + '.js', 'exports.Main=require(' + JSON.stringify(node_path_1.default.join(PACKAGE, 'dist/docgen.js')) + ').renderEdition');
    }
    return { root, m, write, read: (p) => node_fs_1.default.readFileSync(node_path_1.default.join(root, p), 'utf8'), clean: () => node_fs_1.default.rmSync(root, { recursive: true, force: true }) };
}
(0, node_test_1.test)('a feature page explains itself to a reader who knows none of this', async () => {
    const m = model();
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        const page = f.read('docs/features/retry.html');
        strict_1.default.match(page, /adds behaviour around API calls/);
        strict_1.default.match(page, /features are off by\s*\n?\s*default/);
        strict_1.default.match(page, /defaults compiled into the SDK/);
        strict_1.default.match(page, /points in the request lifecycle/);
        // The model content is still there — the prose is an addition, not a
        // replacement.
        strict_1.default.match(page, /PreFetch/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('a feature page never renders a heading with nothing under it', async () => {
    const m = model();
    m.main.kit.feature.proxy = { name: 'proxy', title: 'Outbound proxy', active: true,
        config: { options: {} },
        hook: { PreFetch: { active: false }, PostFetch: { active: false } } };
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        const page = f.read('docs/features/proxy.html');
        // Both sections still appear — a reader asking whether proxy hooks into the
        // pipeline should get an answer, not a missing section.
        strict_1.default.match(page, /Pipeline stages/);
        strict_1.default.match(page, /No pipeline stages are enabled for this feature/);
        strict_1.default.match(page, /This feature takes no configuration options/);
        // And a feature that DOES have active stages still lists them.
        const test = f.read('docs/features/retry.html');
        strict_1.default.match(test, /PreFetch/);
        strict_1.default.ok(!/No pipeline stages are enabled/.test(test));
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('an entity named index does not collide with the API landing page', async () => {
    const m = model();
    m.main.kit.entity.index = { name: 'index', active: true, fields: { id: { n: 'id', h: 'Id', t: 'string', r: true } },
        op: { list: { name: 'list', points: [{ m: 'GET', o: '/index', s: [{ lit: 'index' }] }] } } };
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        // Both pages exist, and they are different pages.
        const overview = f.read('docs/api/index.html');
        const entity = f.read('docs/api/index-entity.html');
        // Both exist and are genuinely different pages. Not "the entity page lacks
        // the words API overview" — every page renders the nav, which links to it.
        strict_1.default.match(overview, /API overview/);
        strict_1.default.notEqual(overview, entity);
        strict_1.default.match(entity, /<h1[^>]*>Index<\/h1>/);
        // And the overview LINKS to the moved page, not to itself — a page that
        // moves without its links is worse than the collision.
        strict_1.default.match(overview, /index-entity\.html/);
    }
    finally {
        f.clean();
    }
});
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
(0, node_test_1.test)('the prose gate reads what docgen wrote, not what the definition said', () => {
    const { authored, proseText } = require('../dist/qa');
    const { prose } = require('../dist/content');
    const page = '<p>Docgen wrote this.</p><table><tr><td>remvoed amound wehn</td></tr></table>';
    strict_1.default.match(authored(page, 'html'), /Docgen wrote this/);
    strict_1.default.doesNotMatch(authored(page, 'html'), /remvoed|amound|wehn/);
    strict_1.default.match(proseText(page, 'html'), /remvoed/);
    const markdown = 'Docgen wrote this.\n\n| Field | Note |\n| --- | --- |\n| id | remvoed |\n';
    strict_1.default.match(authored(markdown, 'md'), /Docgen wrote this/);
    strict_1.default.doesNotMatch(authored(markdown, 'md'), /remvoed/);
    strict_1.default.equal(prose('Bearer scheme.<br/>\r\n          Enter your token.'), 'Bearer scheme. Enter your token.');
    // Escaping still happens after the unwrapping, so no markup survives.
    strict_1.default.equal(prose('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
});
(0, node_test_1.test)('the voice rule reads docgen prose, not quoted specification text', () => {
    const { checkText } = require('../dist/qa');
    const voice = 'Use neutral or second-person prose';
    strict_1.default.ok(checkText('<p>We built this for you.</p>', 'html').includes(voice));
    strict_1.default.ok(checkText('We built this for you.', 'md').includes(voice));
    strict_1.default.ok(!checkText('<table><tr><td>returned for us</td></tr></table>', 'html').includes(voice));
    strict_1.default.ok(!checkText('| Field | Note |\n| --- | --- |\n| id | returned for us |', 'md').includes(voice));
    // Only that rule is narrowed. A defect is a defect wherever it appears.
    strict_1.default.ok(checkText('<table><tr><td>Fast! Really fast!</td></tr></table>', 'html').length > 0);
    strict_1.default.ok(!checkText('<p>See https://docs.microsoft.com/en-us/dotnet/standard</p>', 'html').includes(voice));
});
(0, node_test_1.test)('upstream spec prose is normalised before it reaches the gate', () => {
    const { prose } = require('../dist/content');
    strict_1.default.match(prose('Its 1 based. i.e firstpage is 1'), /that is firstpage/);
    strict_1.default.match(prose('e.g a value'), /for example a value/);
    strict_1.default.match(prose('i.e., the thing'), /that is, the thing/);
    // A DOUBLED WORD, from the same spec: "get the the FX held rates for".
    strict_1.default.equal(prose('get the the FX held rates for'), 'get the FX held rates for');
    // But only where repetition is never correct. English has genuine doublings,
    // and tidying a typo must not rewrite meaning.
    strict_1.default.equal(prose('he had had enough'), 'he had had enough');
    strict_1.default.equal(prose('that that is fine'), 'that that is fine');
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
        // A LATER DOCGEN THAT ADDS A TEMPLATE FILE STILL REACHES THIS PROJECT.
        // Deleting one stands in for a file the package has and the project has
        // not: the next prepareProject restores it, WITHOUT reverting the
        // customised template beside it, and without introducing an edition the
        // project never asked for.
        const added = node_path_1.default.join(root, '.sdk/tm/edition/github-pages/search.js');
        strict_1.default.ok(node_fs_1.default.existsSync(added));
        node_fs_1.default.rmSync(added);
        (0, docgen_1.prepareProject)(root);
        strict_1.default.ok(node_fs_1.default.existsSync(added));
        strict_1.default.equal(node_fs_1.default.readFileSync(file, 'utf8'), 'custom page');
        strict_1.default.ok(!node_fs_1.default.existsSync(node_path_1.default.join(root, '.sdk/tm/edition/presentation')));
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
    m.main.kit.entity.pet.op.list = { name: 'list', points: [{ m: 'GET', o: '/pets', s: [{ lit: 'pets' }] }] };
    definitions.get(m).paths['/pets'] = { get: { security: [], responses: { 200: { description: 'Pet records' } } } };
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
(0, node_test_1.test)('the API reference is structured by entity, route and status', async () => {
    const m = model();
    definitions.get(m).paths['/pets/{id}'].get = {
        operationId: 'loadPet',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Pet identifier.' }],
        security: [{ bearerAuth: [] }],
        securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['tag'],
                        properties: { tag: { type: 'string', description: 'Short label.' } } } } } },
        responses: { '200': { description: 'Pet record', content: { 'application/json': { schema: {
                            type: 'object', required: ['data'], properties: {
                                data: { type: 'object', required: ['name'], properties: {
                                        name: { type: 'string', description: 'Display name.' },
                                        tags: { type: 'array', items: { type: 'string' } }
                                    } },
                                ok: { type: 'boolean' }
                            }
                        } } } },
            '404': { description: 'No such pet' } }
    };
    definitions.get(m).components = { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } };
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        const page = f.read('docs/api/pet.html');
        // An index of every route, each link resolving to a heading on the page.
        strict_1.default.match(page, /Operations/);
        strict_1.default.match(page, /href="#get-petsid"/);
        strict_1.default.match(page, /<h3 id="get-petsid" class="operation" data-method="get">/);
        // The index reports what the route returns, from the 2xx description.
        strict_1.default.match(page, /Pet record/);
        // Responses are classed by status family so each is recognisable.
        strict_1.default.match(page, /<h5 id="200-pet-record" class="status" data-status="2xx">/);
        strict_1.default.match(page, /data-status="4xx"/);
        // Authentication in words, not the raw `security` array.
        strict_1.default.match(page, /Authentication: bearer token/);
        strict_1.default.match(page, /loadPet/);
        // Parameters, with where each one goes.
        strict_1.default.match(page, /Parameters/);
        strict_1.default.match(page, /Pet identifier/);
        // Schemas render as property tables: nested objects flatten to dotted
        // paths, arrays name their element type, and `required` is a column.
        strict_1.default.match(page, /data\.name/);
        strict_1.default.match(page, /array of string/);
        strict_1.default.match(page, /Display name/);
        // ... and the JSON Schema dump they replace is gone.
        strict_1.default.doesNotMatch(page, /&quot;properties&quot;/);
        // The sidebar reaches individual routes, but only for the page being
        // read: every entity page would otherwise list every other page's.
        strict_1.default.match(page, /class="nav-section" href="#get-petsid"/);
        strict_1.default.doesNotMatch(f.read('docs/index.html'), /class="nav-section"/);
        // Operation ids appear in generated prose (specs cross-reference them),
        // so the generated spelling vocabulary has to carry them.
        strict_1.default.match(f.read('.sdk/doc/qa/styles/config/vocabularies/Docgen/accept.txt'), /\[Ll\]\[Oo\]\[Aa\]\[Dd\]\[Pp\]\[Ee\]\[Tt\]/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('the website links back to the SDK repository, declared or derived', async () => {
    // Derived: no `repo` declared, so `<origin>/<name>-sdk` under github.com —
    // the same rule sdkgen uses for go.mod and the package manifests.
    const m = model();
    m.def = 'petstore.json';
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        strict_1.default.match(f.read('docs/index.html'), /class="repo-link" href="https:\/\/github.com\/acme\/petstore-sdk">acme\/petstore-sdk<\/a>/);
        // Every page carries it, not just the index — a reader deep in the
        // reference must be able to get back to the source.
        strict_1.default.match(f.read('docs/api/index.html'), /class="repo-link" href="https:\/\/github.com\/acme\/petstore-sdk"/);
        // The API overview links the OpenAPI definition it was generated from,
        // at the path apidef resolves `def` against.
        strict_1.default.match(f.read('docs/api/index.html'), /href="https:\/\/github.com\/acme\/petstore-sdk\/blob\/main\/.sdk\/def\/petstore.json">OpenAPI specification<\/a>/);
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
    // No definition in the model -> no spec link at all. Linking
    // `.sdk/def/undefined` would be a guaranteed 404 on every generated site.
    const m3 = model();
    delete m3.def;
    const f3 = fixture(m3);
    try {
        await (0, docgen_1.generate)({ folder: f3.root, model: m3 });
        strict_1.default.doesNotMatch(f3.read('docs/api/index.html'), /OpenAPI specification|\.sdk\/def\//);
    }
    finally {
        f3.clean();
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
(0, node_test_1.test)('the deck teaches capabilities, then a tutorial, then extending with sdkgen', async () => {
    const m = model();
    m.main.kit.doc.edition.deck = { kind: 'presentation', output: { path: 'docs/slidev' } };
    const f = fixture(m);
    try {
        await (0, docgen_1.generate)({ folder: f.root, model: m });
        const deck = f.read('docs/slidev/slides.md');
        const at = (heading) => deck.indexOf('# ' + heading);
        strict_1.default.ok(-1 < at('API capabilities'));
        strict_1.default.ok(at('API capabilities') < at('Tutorial: your first call'));
        strict_1.default.ok(at('Tutorial: your first call') < at('This SDK is generated'));
        const capabilitySlides = (deck.match(/# API capabilities/g) || []).length;
        strict_1.default.ok(4 > capabilitySlides, 'capabilities capped at three slides, got ' + capabilitySlides);
        const many = model();
        many.main.kit.doc.edition.deck = { kind: 'presentation', output: { path: 'docs/slidev' } };
        const pet = many.main.kit.entity.pet;
        for (let i = 0; 40 > i; i++) {
            const clone = JSON.parse(JSON.stringify(pet));
            clone.name = 'pet' + i;
            delete clone.Name;
            many.main.kit.entity['pet' + i] = clone;
        }
        const big = fixture(many);
        try {
            await (0, docgen_1.generate)({ folder: big.root, model: many });
            const bigDeck = big.read('docs/slidev/slides.md');
            strict_1.default.equal((bigDeck.match(/# API capabilities/g) || []).length, 3);
            strict_1.default.match(bigDeck, /and \d+ more, in the API reference/);
        }
        finally {
            big.clean();
        }
        // Act one states what comes with the SDK, features included. They were
        // absent from the deck entirely, though they are half of what it offers.
        strict_1.default.match(deck, /Built-in features/);
        strict_1.default.match(deck, /Authentication/);
        strict_1.default.match(deck, /Step 1: install/);
        strict_1.default.match(deck, /Step 3: call an operation/);
        strict_1.default.match(deck, /await client\.Pet\(\)\.load\(/);
        strict_1.default.match(deck, /Step 4: handle the failure/);
        strict_1.default.match(deck, /catch/);
        // Act three is about the generator, and names the one rule that decides
        // whether a customisation survives.
        strict_1.default.match(deck, /voxgig-sdkgen target add/);
        strict_1.default.match(deck, /voxgig-sdkgen feature add/);
        strict_1.default.match(deck, /project\.aon/);
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
(0, node_test_1.test)('build facts supply reference content and QA vocabulary without reading the spec again', async () => {
    const f = fixture();
    try {
        node_fs_1.default.unlinkSync(node_path_1.default.join(f.root, '.sdk/def/' + f.m.def));
        const calls = [];
        await (0, docgen_1.generate)({ folder: f.root, model: f.m, meta: { apidef: { operation: (method, path) => {
                        calls.push(method + ' ' + path);
                        return { operationId: 'astrochronometryLookup', responses: { 200: { description: 'Astrochronometry records' } } };
                    } } } });
        strict_1.default.ok(calls.every(key => key === 'GET /pets/{id}'));
        strict_1.default.match(f.read('docs/api/pet.html'), /Astrochronometry records/);
        const vocabulary = f.read('.sdk/doc/qa/styles/config/vocabularies/Docgen/accept.txt');
        strict_1.default.ok(vocabulary.split('\n').some(line => line && new RegExp('^' + line + '$').test('astrochronometryLookup')));
        strict_1.default.ok(vocabulary.split('\n').some(line => line && new RegExp('^' + line + '$').test('Astrochronometry')));
        await strict_1.default.rejects((0, docgen_1.generate)({ folder: f.root, model: f.m }), /ENOENT/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('standalone CLI reads the local specification with compact model points', () => {
    const f = fixture();
    try {
        f.write('.sdk/model/sdk.json', JSON.stringify(f.m));
        const result = (0, node_child_process_1.spawnSync)(process.execPath, [node_path_1.default.join(PACKAGE, 'bin/voxgig-docgen'), 'generate', f.root], { encoding: 'utf8' });
        strict_1.default.equal(result.status, 0, result.stderr);
        strict_1.default.match(f.read('docs/api/pet.html'), /Pet record/);
        strict_1.default.match(f.read('docs/api/pet.html'), /Parameters/);
    }
    finally {
        f.clean();
    }
});
(0, node_test_1.test)('inactive editions do not require a specification', async () => {
    const f = fixture();
    try {
        node_fs_1.default.unlinkSync(node_path_1.default.join(f.root, '.sdk/def/' + f.m.def));
        for (const edition of Object.values(f.m.main.kit.doc.edition))
            edition.active = false;
        strict_1.default.deepEqual(await (0, docgen_1.generate)({ folder: f.root, model: f.m }), { editions: [], files: [] });
    }
    finally {
        f.clean();
    }
});
//# sourceMappingURL=docgen.test.js.map