"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledgerText = exports.applyPrune = exports.prunePlan = exports.readLedger = exports.relativePath = exports.runQA = exports.proseText = exports.checkText = exports.slides = exports.pages = exports.summary = exports.view = void 0;
exports.styleFor = styleFor;
exports.renderEdition = renderEdition;
exports.generate = generate;
exports.stageSite = stageSite;
exports.scaffoldDefaults = scaffoldDefaults;
exports.prepareProject = prepareProject;
const sdk_reference_1 = require("./sdk-reference");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_module_1 = require("node:module");
const jostraca_1 = require("jostraca");
const content_1 = require("./content");
const ledger_1 = require("./ledger");
const MarkdownIt = require('markdown-it');
const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
const OPERATION_RE = new RegExp('^`?(' + content_1.METHODS + ')`?\\s', 'i');
markdown.renderer.rules.heading_open = (tokens, index, options, env, self) => {
    const title = tokens[index + 1]?.content || '';
    const slug = (0, content_1.slugFor)(title);
    env.headings ??= {};
    const count = env.headings[slug] || 0;
    env.headings[slug] = count + 1;
    tokens[index].attrSet('id', slug + (count ? '-' + count : ''));
    const operation = OPERATION_RE.exec(title);
    if (operation) {
        tokens[index].attrJoin('class', 'operation');
        tokens[index].attrSet('data-method', operation[1].toLowerCase());
    }
    const status = /^([1-5])\d\d\b/.exec(title);
    if (status) {
        tokens[index].attrJoin('class', 'status');
        tokens[index].attrSet('data-status', status[1] + 'xx');
    }
    return self.renderToken(tokens, index, options);
};
const PACKAGE = node_path_1.default.resolve(__dirname, '..');
const LEDGER = '.sdk/doc/generated.json';
const NOTHING = { files: [], folders: [], refused: [] };
function walk(fs, root, at = '') {
    if (!fs.existsSync(root))
        return [];
    return fs.readdirSync(root).sort().flatMap((n) => {
        if (n.startsWith('.') || n === 'node_modules')
            return [];
        const path = node_path_1.default.join(root, n), rel = at ? at + '/' + n : n;
        const stat = fs.lstatSync(path);
        if (stat.isSymbolicLink())
            throw new Error('Documentation source is a symlink: ' + path);
        return stat.isDirectory() ? walk(fs, path, rel) : [rel];
    });
}
function template(props, file, data) {
    const path = (0, ledger_1.inside)(props.root, '.sdk/tm/edition/' + props.edition.name + '/' + file, props.fs);
    const text = String(props.fs.readFileSync(path, 'utf8'));
    return text.replace(/\{\{([\w]+)\}\}/g, (all, name) => {
        if (!(name in data))
            throw new Error('Unknown documentation template slot: ' + name);
        return data[name];
    });
}
function styleFor(model, edition) {
    const common = model.main.kit.doc?.style ?? {}, own = edition.style ?? {};
    return { mode: 'light', font: 'Nunito, system-ui, sans-serif', mono: 'ui-monospace, monospace', logo: '', fontFile: '', headingFont: common.font || 'Nunito, system-ui, sans-serif', headingFontFile: '', monoFile: '', ...common, ...own,
        color: { primary: '#e70042', accent: '#00c6d8', background: '#f5f5f9', text: '#0a0a0a', darkBackground: '#0f1117', darkText: '#e6edf3', ...common.color, ...own.color } };
}
function styleFiles(props, prefix, templateName, files) {
    const style = styleFor(props.model, props.edition);
    if (!['auto', 'light', 'dark'].includes(style.mode))
        throw new Error('doc.style.mode must be auto, light, or dark');
    for (const value of Object.values(style.color))
        if (!/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(String(value)))
            throw new Error('Documentation colours must be hex colours: ' + value);
    for (const value of [style.font, style.headingFont, style.mono])
        if (!/^[\w ,'-]+$/.test(value))
            throw new Error('Invalid font family: ' + value);
    let logo = '', fontFace = '';
    const assets = props.model.main.kit.doc?.assets?.path || '.sdk/doc/assets';
    for (const [key, value] of [['logo', style.logo], ['font', style.fontFile], ['heading-font', style.headingFontFile], ['mono-font', style.monoFile]]) {
        if (!value)
            continue;
        const source = (0, ledger_1.inside)(props.root, assets + '/' + value, props.fs);
        const ext = node_path_1.default.extname(value).toLowerCase();
        if (!(key !== 'logo' ? ['.woff', '.woff2'] : ['.svg', '.png', '.jpg', '.jpeg', '.webp']).includes(ext))
            throw new Error('Unsupported documentation asset: ' + value);
        const dest = key + ext;
        files[prefix + 'assets/' + dest] = props.fs.readFileSync(source);
        if (key !== 'logo' && props.fs.existsSync(source + '.license.txt'))
            files[prefix + (props.edition.kind === 'presentation' ? 'public/' : '') + 'assets/' + dest + '.license.txt'] = props.fs.readFileSync((0, ledger_1.inside)(props.root, assets + '/' + value + '.license.txt', props.fs));
        if (key === 'logo')
            logo = dest;
        else {
            const family = key === 'font' ? 'DocgenLocal' : key === 'heading-font' ? 'DocgenHeading' : 'DocgenMono';
            fontFace += '@font-face{font-family:' + family + ';src:url("./' + dest + '");font-weight:100 900;font-display:swap}\n';
        }
    }
    // Bundle the default font only when a body or heading actually uses it.
    // Project font assets take precedence; custom themes do not inherit Nunito.
    if ((!style.fontFile && /^'?Nunito\b/.test(style.font)) || (!style.headingFontFile && /^'?Nunito\b/.test(style.headingFont))) {
        files[prefix + 'assets/nunito.woff2'] = node_fs_1.default.readFileSync(node_path_1.default.join(PACKAGE, 'assets/nunito.woff2'));
        files[prefix + (props.edition.kind === 'presentation' ? 'public/' : '') + 'assets/nunito.woff2.license.txt'] = node_fs_1.default.readFileSync(node_path_1.default.join(PACKAGE, 'assets/nunito.woff2.license.txt'));
        fontFace += '@font-face{font-family:Nunito;src:url("./nunito.woff2");font-weight:100 900;font-display:swap}\n';
    }
    const colors = style.color;
    const dark = '--background:' + colors.darkBackground + ';--text:' + colors.darkText + ';color-scheme:dark;';
    const mode = style.mode === 'dark' ? ':root{' + dark + '}' : style.mode === 'auto' ? '@media(prefers-color-scheme:dark){:root{' + dark + '}}' : '';
    files[prefix + 'assets/style.css'] = template(props, templateName, {
        primary: colors.primary, accent: colors.accent, background: colors.background, text: colors.text,
        font: (style.fontFile ? 'DocgenLocal,' : '') + style.font, headingFont: (style.headingFontFile ? 'DocgenHeading,' : '') + style.headingFont, mono: (style.monoFile ? 'DocgenMono,' : '') + style.mono, mode, fontFace,
    });
    return { logo };
}
function authored(props) {
    const folder = props.model.main.kit.doc?.content?.path || '.sdk/doc/content';
    const source = (0, ledger_1.inside)(props.root, folder, props.fs);
    const result = { pages: [], assets: {} };
    for (const name of walk(props.fs, source)) {
        const content = props.fs.readFileSync(node_path_1.default.join(source, name));
        if (/\.md$/i.test(name)) {
            const text = String(content), title = /^# (.+)$/m.exec(text)?.[1] || node_path_1.default.basename(name, '.md');
            result.pages.push({ path: 'additional/' + name.replace(/\.md$/i, ''), title, group: 'Additional guides', markdown: text });
        }
        else if (/\.(png|jpg|jpeg|svg|webp|woff2?)$/i.test(name))
            result.assets['additional/' + name] = content;
    }
    return result;
}
function safeMarkdown(text, inline = false) {
    // Markdown has no executable HTML. Resource URLs must work without a network.
    const tokens = markdown.parse(text, {});
    function check(tokens) {
        for (const token of tokens) {
            if (token.type === 'image' && /^(?:[a-z]+:|\/\/)/i.test(token.attrGet('src') || ''))
                throw new Error('Documentation images must use local assets');
            if (token.children)
                check(token.children);
        }
    }
    check(tokens);
    const source = text.replace(/(\]\([^\s)]+)\.md(?=[#)])/g, '$1.html');
    return inline ? markdown.renderInline(source) : markdown.render(source);
}
function nestedPresentations(model, site) {
    const prefix = (0, ledger_1.relativePath)(site.output.path) + '/';
    return (0, content_1.rows)(model.main.kit.doc?.edition).filter(e => e.kind === 'presentation' && e.output?.path?.startsWith(prefix));
}
// Edition components can wrap or replace this function. All output is emitted
// through the same Jostraca pass and included in ownership and QA manifests.
function renderEdition(props) {
    const { edition } = props, v = (0, content_1.view)(props.model, edition, props.resolved);
    const path = (0, ledger_1.relativePath)(edition.output.path);
    const brand = { ...v.kit.doc?.brand, ...edition.brand };
    if (brand.url && !/^https?:\/\//i.test(brand.url))
        throw new Error('Documentation brand URL must use HTTP or HTTPS');
    if (brand.url)
        new URL(brand.url);
    const repo = (0, content_1.repoLinkFor)(props.model);
    const branding = {
        providerLink: brand.url ? '<a class="provider-link" href="' + (0, content_1.html)(brand.url) + '">' + (0, content_1.html)(brand.label || new URL(brand.url).hostname) + '</a>' : '',
        repoLink: '<a class="repo-link" href="' + (0, content_1.html)(repo.url) + '">' + (0, content_1.html)(repo.path) + '</a>',
        notice: (0, content_1.html)(brand.notice || ''), shortNotice: (0, content_1.html)(brand.shortNotice || brand.notice || ''),
    };
    const result = { files: {}, qa: [] }, files = result.files;
    const examplePath = (0, ledger_1.inside)(props.root, '.sdk/tm/edition/' + edition.name + '/sdk-setup.json', props.fs);
    const setupTemplates = props.fs.existsSync(examplePath) ? JSON.parse(props.fs.readFileSync(examplePath, 'utf8')) : {};
    const examples = Object.fromEntries(v.targets.map(t => [t.name, (0, sdk_reference_1.setupExample)(props.model, t, setupTemplates)]));
    const put = (name, text, qa = false) => { files[name] = text; if (qa)
        result.qa.push(name); };
    if (edition.kind === 'summary') {
        if (!path.endsWith('.md'))
            throw new Error('The summary output path must end in .md');
        put(path, template(props, 'summary.md', { content: (0, content_1.summary)(v) }), true);
    }
    else if (edition.kind === 'github-pages') {
        const prefix = path + '/', own = authored(props), all = [...(0, content_1.pages)(v, examples), ...own.pages];
        const seen = new Set();
        for (const page of all) {
            (0, ledger_1.relativePath)(page.path);
            if (seen.has(page.path))
                throw new Error('Duplicate documentation page: ' + page.path);
            seen.add(page.path);
        }
        const { logo } = styleFiles(props, prefix, 'style.css', files);
        for (const [name, content] of Object.entries(own.assets))
            files[prefix + name] = content;
        for (const page of all) {
            const base = '../'.repeat(page.path.split('/').length - 1);
            const groups = [...new Set(all.map(p => p.group))];
            // A page's own sections are listed UNDER it, and only while it is the
            // page being read. The API reference puts every route of an entity on
            // one page, so without this the sidebar stops at the entity and a
            // reader has no way to jump to a route, which is exactly what an API
            // reference is navigated by.
            const navLink = (p) => {
                const link = '<a' + (p.path === page.path ? ' aria-current="page"' : '') +
                    ' href="' + (0, content_1.html)(base + p.path + '.html') + '">' + (0, content_1.html)(p.title) + '</a>';
                const sections = p.path === page.path ? (p.sections ?? []) : [];
                return !sections.length ? link : link + '<div class="nav-sections">' +
                    sections.map(s => '<a class="nav-section" href="#' + (0, content_1.html)(s.id) + '">' +
                        (0, content_1.html)(s.title) + '</a>').join('\n') + '</div>';
            };
            const nav = groups.map(group => '<details' + (group === page.group ? ' open' : '') + '><summary>' + (0, content_1.html)(group) + '</summary>' +
                all.filter(p => p.group === group).map(navLink).join('\n') + '</details>').join('\n');
            const presentationLinks = nestedPresentations(props.model, edition)
                .filter(e => e.active !== false && e.site?.active !== false)
                .map(e => '<a class="presentation-link" href="' + (0, content_1.html)(base + (0, ledger_1.relativePath)(e.output.path).slice(prefix.length) + '/index.html') + '">' + (0, content_1.html)(e.title || 'Presentation') + '</a>').join('\n');
            put(prefix + page.path + '.html', template(props, 'page.html', {
                ...branding, notice: safeMarkdown(brand.notice || '', true), title: (0, content_1.html)(page.title), site: (0, content_1.html)(v.title), content: safeMarkdown(page.markdown), nav, base, presentationLinks, section: (0, content_1.html)(page.group),
                logo: logo ? '<img class="logo" src="' + base + 'assets/' + logo + '" alt="' + (0, content_1.html)(v.title) + '">' : '',
            }), true);
        }
        put(prefix + '.nojekyll', '');
        put(prefix + 'assets/search.js', 'window.DOCGEN_SEARCH=' + JSON.stringify(all.map(p => ({ title: p.title, path: p.path + '.html', text: p.markdown.replace(/```[\s\S]*?```/g, '').slice(0, 15000) }))).replace(/</g, '\\u003c') + ';\n' + template(props, 'search.js', {}));
    }
    else if (edition.kind === 'presentation') {
        const prefix = path + '/';
        // System/local fonts only: Slidev must not request Google Fonts at runtime.
        put(prefix + 'slides.md', template(props, 'slides.md', { content: (0, content_1.slides)(v, examples.ts ? '\n```ts\n' + examples.ts + '\n```\n' : ''), title: JSON.stringify(v.title), mode: styleFor(props.model, edition).mode }), true);
        const { logo } = styleFiles(props, prefix, 'style.css', files);
        put(prefix + 'global-top.vue', template(props, 'global-top.vue', { ...branding, logo, logoImage: logo ? '<img class="deck-logo" src="./assets/' + logo + '" alt="">' : '', title: (0, content_1.html)(v.title) }), true);
        put(prefix + 'style.css', '@import "./assets/style.css";\n');
        put(prefix + 'package.json', template(props, 'package.json', {}));
        put(prefix + 'uno.config.ts', template(props, 'uno.config.ts', {}));
    }
    else
        throw new Error('Unknown documentation edition kind: ' + edition.kind);
    return result;
}
function entityNames(name) {
    const n = {};
    (0, jostraca_1.names)(n, name);
    return n.Name;
}
function qaResources(model, resolved) {
    const files = {};
    for (const file of walk(node_fs_1.default, node_path_1.default.join(PACKAGE, 'qa')))
        files['.sdk/doc/qa/' + file] = node_fs_1.default.readFileSync(node_path_1.default.join(PACKAGE, 'qa', file), 'utf8');
    const vocabulary = model.main.kit.doc?.qa?.vocabulary ?? [];
    if (vocabulary.some((s) => typeof s !== 'string' || !/^[\w -]+$/.test(s)))
        throw new Error('QA vocabulary entries must be literal words or phrases');
    const facts = (0, content_1.rows)(model.main.kit.entity).flatMap((entity) => (0, content_1.rows)(entity.op).flatMap((op) => (op.points ?? []).filter((point) => point.a !== false)
        .map((point) => (0, content_1.operationFacts)(point, resolved))));
    const operationIds = facts.map(fact => fact.operationId);
    const described = [];
    const harvest = (node, depth = 0) => {
        if (!node || 24 < depth)
            return;
        if ('string' === typeof node) {
            described.push(node);
            return;
        }
        if (Array.isArray(node)) {
            for (const item of node)
                harvest(item, depth + 1);
            return;
        }
        if ('object' !== typeof node)
            return;
        for (const key of ['desc', 'description', 'short', 'title', 'summary', 'sh', 'h']) {
            if ('string' === typeof node[key])
                described.push(node[key]);
        }
        for (const value of Object.values(node))
            if (value && 'object' === typeof value)
                harvest(value, depth + 1);
    };
    harvest(model.main.kit.entity);
    harvest(model.main.kit.info);
    harvest(facts);
    const specWords = [...new Set(described.join(' ').match(/[A-Za-z][A-Za-z0-9]{1,}/g) ?? [])].slice(0, 20000);
    const words = [model.name, ...(0, content_1.rows)(model.main.kit.target).flatMap(t => [t.name, t.title]), ...(0, content_1.rows)(model.main.kit.entity).flatMap(e => [e.name, entityNames(e.name)]), ...operationIds, ...specWords, ...vocabulary]
        .filter(Boolean).map(w => Array.from(String(w), c => /[a-z]/i.test(c) ? '[' + c.toUpperCase() + c.toLowerCase() + ']' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(''));
    files['.sdk/doc/qa/styles/config/vocabularies/Docgen/accept.txt'] += '\n' + words.join('\n') + '\n';
    return files;
}
function workflow(model, site, editions) {
    const branch = model.main.kit.doc?.ci?.branch || 'main';
    if (!/^[\w./-]+$/.test(branch))
        throw new Error('Invalid documentation CI branch');
    let source = node_fs_1.default.readFileSync(node_path_1.default.join(PACKAGE, 'qa/workflow.yml'), 'utf8');
    source = source.replaceAll('{{branch}}', branch);
    const presentations = editions.filter(e => e.kind === 'presentation');
    source = source.replace('{{presentations}}', presentations.map(e => '      - name: Build presentation ' + e.name + '\n' +
        '        env:\n          EDITION_PATH: ' + JSON.stringify((0, ledger_1.relativePath)(e.output.path)) + '\n' +
        '        run: |\n          npm install --prefix "$EDITION_PATH" --no-audit --no-fund\n          npm run build --prefix "$EDITION_PATH"').join('\n'));
    source = source.replace('{{stageSite}}', site ?
        '      - name: Stage generated website\n        id: site\n        run: echo "path=$(node .sdk/node_modules/@voxgig/docgen/bin/voxgig-docgen stage ' + site.name + ')" >> "$GITHUB_OUTPUT"' : '');
    source = source.replace('{{artifactPath}}', site ? '${{ steps.site.outputs.path }}' : JSON.stringify('.sdk/doc/qa-manifest.json'));
    if (site)
        source = source.replace('{{deploy}}', node_fs_1.default.readFileSync(node_path_1.default.join(PACKAGE, 'qa/pages-job.yml'), 'utf8').replaceAll('{{path}}', (0, ledger_1.relativePath)(site.output.path)).replaceAll('{{branch}}', branch));
    else
        source = source.replace('{{deploy}}', '');
    return source;
}
function emit(files) {
    for (const [path, text] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
        const parts = path.split('/'), name = parts.pop();
        const file = () => {
            // Binary assets are copied separately after the text pass.
            (0, jostraca_1.File)({ name, ...(path.startsWith('.sdk/admin/') && path.endsWith('.sh') ? { mode: 0o755 } : {}) }, () => (0, jostraca_1.Content)(String(text)));
        };
        const nested = (index) => index === parts.length ? file() : (0, jostraca_1.Folder)({ name: parts[index] }, () => nested(index + 1));
        nested(0);
    }
}
async function resolveDefinition(root, model, fs) {
    if (!model.def)
        return undefined;
    const file = (0, ledger_1.inside)(root, '.sdk/def/' + (0, ledger_1.relativePath)(model.def), fs);
    const load = (0, node_module_1.createRequire)(node_path_1.default.join(root, '.sdk/package.json'));
    const { parse, operationFacts: facts } = load('@voxgig/apidef');
    const graphql = /\.(graphqls?|gql|graphql\.json)$/i.test(model.def);
    const kind = graphql ? 'GraphQL' : 'OpenAPI';
    const def = await parse(kind, fs.readFileSync(file, 'utf8'), {
        file, graphql: { endpoint: model.main.kit.info?.servers?.[0]?.url, title: model.name },
    });
    return { version: 1, kind, def, operation: (m, o) => facts(def, { m, o }) };
}
async function generate(opts) {
    const root = node_path_1.default.resolve(opts.folder), fs = typeof opts.fs === 'function' ? opts.fs() : opts.fs || node_fs_1.default;
    if (!fs.existsSync(node_path_1.default.join(root, '.sdk')))
        throw new Error('Docgen requires an existing .sdk setup');
    const model = opts.model;
    if (!model?.main?.kit)
        throw new Error('Docgen requires the compiled apidef/sdkgen model');
    const doc = model.main.kit.doc;
    if (!doc || doc.active === false)
        return { editions: [], files: [], prune: NOTHING };
    const editions = Object.keys(doc.edition ?? {}).sort().map(name => ({ ...doc.edition[name], name })).filter(e => e.active !== false);
    if (!editions.length)
        return { editions: [], files: [], prune: NOTHING };
    const resolved = opts.meta?.apidef || await resolveDefinition(root, model, fs);
    const files = {}, qa = [], claims = [];
    // The prune is confined to these, so each one is declared beside the writes
    // it covers and nothing else in the repository is ever a candidate.
    const roots = [LEDGER, '.sdk/doc/qa', '.sdk/doc/qa-manifest.json'];
    for (const edition of editions) {
        if (!/^[a-z][a-z0-9-]*$/.test(edition.name))
            throw new Error('Invalid edition name: ' + edition.name);
        const path = (0, ledger_1.relativePath)(edition.output?.path);
        if (['.sdk', '.git', '.github'].some(p => path === p || path.startsWith(p + '/')))
            throw new Error('Edition output overlaps project configuration: ' + path);
        for (const target of (0, content_1.rows)(model.main.kit.target)) {
            const tpath = target.output?.path || target.name;
            if (path === tpath || path.startsWith(tpath + '/') || tpath.startsWith(path + '/'))
                throw new Error('Edition output overlaps SDK target: ' + path);
        }
        for (const claim of claims) {
            const overlaps = claim.path === path || claim.path.startsWith(path + '/') || path.startsWith(claim.path + '/');
            const nestedPresentation = (claim.kind === 'github-pages' && edition.kind === 'presentation' && path.startsWith(claim.path + '/')) ||
                (edition.kind === 'github-pages' && claim.kind === 'presentation' && claim.path.startsWith(path + '/'));
            if (overlaps && !nestedPresentation)
                throw new Error('Edition outputs overlap: ' + path);
        }
        claims.push({ path, kind: edition.kind });
        roots.push(path);
        const modulePath = (0, ledger_1.inside)(root, '.sdk/dist/cmp/edition/' + edition.name + '/Main_' + edition.name + '.js', fs);
        const load = (0, node_module_1.createRequire)(node_path_1.default.join(root, '.sdk/package.json'));
        // The compiler emits these customisable components; never fall back to a
        // different emitter when a project component is missing or broken.
        const Main = load(modulePath).Main;
        const result = Main({ model, edition, root, fs, resolved });
        for (const [file, content] of Object.entries(result.files)) {
            if (file !== path && !file.startsWith(path + '/'))
                throw new Error('Edition emitted outside its output: ' + file);
            if (edition.kind === 'github-pages' && nestedPresentations(model, edition).some(e => file === e.output.path || file.startsWith(e.output.path + '/')))
                throw new Error('Website output overlaps presentation: ' + file);
            if (Object.keys(files).some(owned => file === owned || file.startsWith(owned + '/') || owned.startsWith(file + '/')))
                throw new Error('Duplicate edition output: ' + file);
            files[file] = content;
        }
        qa.push(...(result.qa ?? []));
        // Always gate actual rendered text, even when a custom component omits qa.
        qa.push(...Object.keys(result.files).filter(p => /\.(md|html|vue)$/.test(p)));
    }
    Object.assign(files, qaResources(model, resolved));
    const routes = Object.fromEntries(editions.filter(e => e.kind === 'github-pages').flatMap(site => nestedPresentations(model, site).filter(e => e.active !== false && e.site?.active !== false)
        .map(e => [e.output.path + '/index.html', e.output.path + '/dist/index.html'])));
    files['.sdk/doc/qa-manifest.json'] = JSON.stringify({ files: [...new Set(qa)].sort(), config: '.sdk/doc/qa/vale.ini', routes }, null, 2) + '\n';
    if (doc.ci?.active !== false) {
        const sites = editions.filter(e => e.kind === 'github-pages');
        if (sites.length > 1)
            throw new Error('Only one GitHub Pages deployment can be configured per repository');
        files['.github/workflows/docgen.yml'] = workflow(model, sites[0], editions);
        roots.push('.github/workflows/docgen.yml');
        if (sites.length) {
            files['.sdk/admin/setup-github-pages.sh'] = node_fs_1.default.readFileSync(node_path_1.default.join(PACKAGE, 'admin/setup-github-pages.sh'), 'utf8');
            roots.push('.sdk/admin/setup-github-pages.sh');
        }
    }
    for (const path of Object.keys(files))
        (0, ledger_1.inside)(root, path, fs);
    const unrooted = Object.keys(files).filter(p => !roots.some(r => (0, ledger_1.within)(r, p)));
    if (unrooted.length)
        throw new Error('Generated file outside every output root: ' + unrooted[0]);
    const dryrun = !!opts.control?.dryrun;
    const previous = (0, ledger_1.readLedger)(fs, node_path_1.default.join(root, LEDGER));
    files[LEDGER] = (0, ledger_1.ledgerText)(roots, [...Object.keys(files), LEDGER]);
    const prune = (0, ledger_1.prunePlan)(fs, root, previous, new Set(Object.keys(files)));
    const textFiles = Object.fromEntries(Object.entries(files).filter(([, v]) => !Buffer.isBuffer(v)));
    await (0, jostraca_1.Jostraca)().generate({ ...opts, fs: () => fs, folder: root, model,
        existing: { txt: { write: true, merge: false }, bin: { write: true } }, control: { dryrun } }, () => (0, jostraca_1.Project)({}, () => emit(textFiles)));
    if (!dryrun) {
        // Binary files retain their original bytes. Paths were preflighted above.
        for (const [path, data] of Object.entries(files))
            if (Buffer.isBuffer(data)) {
                fs.mkdirSync(node_path_1.default.dirname(node_path_1.default.join(root, path)), { recursive: true });
                fs.writeFileSync(node_path_1.default.join(root, path), data);
            }
        (0, ledger_1.applyPrune)(fs, root, prune);
    }
    report(opts.log, dryrun, prune);
    return { editions: editions.map(e => e.name), files: Object.keys(files), prune };
}
function report(log, dryrun, prune) {
    const retired = prune.files.length + prune.folders.length;
    if (!retired && !prune.refused.length)
        return;
    log?.info?.({
        point: 'docgen-prune', dryrun, files: prune.files.length,
        folders: prune.folders.length, refused: prune.refused,
        note: (dryrun ? 'would retire ' : 'retired ') + retired +
            (prune.refused.length ? ', refusing ' + prune.refused.join(', ') : ''),
    });
}
var content_2 = require("./content");
Object.defineProperty(exports, "view", { enumerable: true, get: function () { return content_2.view; } });
Object.defineProperty(exports, "summary", { enumerable: true, get: function () { return content_2.summary; } });
Object.defineProperty(exports, "pages", { enumerable: true, get: function () { return content_2.pages; } });
Object.defineProperty(exports, "slides", { enumerable: true, get: function () { return content_2.slides; } });
var qa_1 = require("./qa");
Object.defineProperty(exports, "checkText", { enumerable: true, get: function () { return qa_1.checkText; } });
Object.defineProperty(exports, "proseText", { enumerable: true, get: function () { return qa_1.proseText; } });
Object.defineProperty(exports, "runQA", { enumerable: true, get: function () { return qa_1.runQA; } });
var ledger_2 = require("./ledger");
Object.defineProperty(exports, "relativePath", { enumerable: true, get: function () { return ledger_2.relativePath; } });
Object.defineProperty(exports, "readLedger", { enumerable: true, get: function () { return ledger_2.readLedger; } });
Object.defineProperty(exports, "prunePlan", { enumerable: true, get: function () { return ledger_2.prunePlan; } });
Object.defineProperty(exports, "applyPrune", { enumerable: true, get: function () { return ledger_2.applyPrune; } });
Object.defineProperty(exports, "ledgerText", { enumerable: true, get: function () { return ledger_2.ledgerText; } });
// A documentation output directory can also contain project-owned notes.
// Deployment must copy only files recorded by the generator, into a fresh
// temporary directory, so unrelated files never enter the Pages artifact.
function stageSite(root, name) {
    root = node_path_1.default.resolve(root);
    const model = JSON.parse(node_fs_1.default.readFileSync((0, ledger_1.inside)(root, '.sdk/model/sdk.json', node_fs_1.default), 'utf8'));
    const edition = model.main?.kit?.doc?.edition?.[name];
    if (!edition || edition.kind !== 'github-pages' || edition.active === false)
        throw new Error('Not an active website edition: ' + name);
    const prefix = (0, ledger_1.relativePath)(edition.output.path) + '/';
    const manifest = (0, ledger_1.readLedger)(node_fs_1.default, (0, ledger_1.inside)(root, LEDGER, node_fs_1.default));
    const presentations = nestedPresentations(model, edition);
    const files = manifest.files.filter((p) => p.startsWith(prefix) &&
        !presentations.some(e => p.startsWith((0, ledger_1.relativePath)(e.output.path) + '/')));
    if (!files.includes(prefix + 'index.html'))
        throw new Error('Generate the website before staging it');
    const sources = files.map(file => ({ from: (0, ledger_1.inside)(root, file, node_fs_1.default), relative: (0, ledger_1.relativePath)(file.slice(prefix.length)) }));
    for (const file of sources)
        if (!node_fs_1.default.statSync(file.from).isFile())
            throw new Error('Missing generated website file: ' + file.from);
    for (const presentation of presentations.filter(e => e.active !== false && e.site?.active !== false)) {
        const output = (0, ledger_1.relativePath)(presentation.output.path);
        const dist = (0, ledger_1.inside)(root, output + '/dist', node_fs_1.default);
        if (!node_fs_1.default.existsSync(node_path_1.default.join(dist, 'index.html')))
            throw new Error('Build presentation ' + presentation.name + ' before staging the website');
        for (const file of walk(node_fs_1.default, dist)) {
            const relative = (0, ledger_1.relativePath)(output.slice(prefix.length) + '/' + file);
            if (sources.some(existing => existing.relative === relative || existing.relative.startsWith(relative + '/') || relative.startsWith(existing.relative + '/')))
                throw new Error('Presentation build overlaps website output: ' + relative);
            sources.push({ from: (0, ledger_1.inside)(root, output + '/dist/' + file, node_fs_1.default), relative });
        }
    }
    const destination = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'docgen-pages-'));
    for (const file of sources) {
        const to = node_path_1.default.join(destination, file.relative);
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(to), { recursive: true });
        node_fs_1.default.copyFileSync(file.from, to);
    }
    return destination;
}
// create-sdkgen installs this package-owned starter set after dependencies are available.
// Explicit edition add remains the resync path for existing projects.
function scaffoldDefaults() {
    const out = {};
    const defaults = ['summary', 'github-pages'];
    for (const name of defaults) {
        const source = node_fs_1.default.readFileSync(node_path_1.default.join(PACKAGE, 'project/.sdk/model/edition/' + name + '.aontu'), 'utf8');
        out['model/edition/' + name + '.aontu'] = source.replace("base: 'BASE'", "base: 'node_modules/@voxgig/docgen/project/.sdk'\n  package: '@voxgig/docgen'");
        for (const tree of ['src/cmp/edition/', 'tm/edition/']) {
            const dir = node_path_1.default.join(PACKAGE, 'project/.sdk', tree, name);
            for (const file of walk(node_fs_1.default, dir))
                out[tree + name + '/' + file] = node_fs_1.default.readFileSync(node_path_1.default.join(dir, file), 'utf8');
        }
    }
    out['model/edition/edition-index.aontu'] = defaults.map(n => '@"./' + n + '.aontu"').join('\n') + '\n';
    return out;
}
// `./` is optional; the extension is not: a `.aon` line names another file.
function sameInclude(a, b) {
    const norm = (s) => s.trim().replace(/^@"\.\//, '@"');
    return norm(a) === norm(b);
}
// The entry model a project HAS: `.aontu`, else the pre-rename `.aon`.
function modelEntryPath(root) {
    const current = (0, ledger_1.inside)(root, '.sdk/model/sdk.aontu', node_fs_1.default);
    if (node_fs_1.default.existsSync(current)) {
        return current;
    }
    const legacy = (0, ledger_1.inside)(root, '.sdk/model/sdk.aon', node_fs_1.default);
    return node_fs_1.default.existsSync(legacy) ? legacy : current;
}
const INDEX_INCLUDE = '@"./edition/edition-index.aontu"';
const LEGACY_INDEX_INCLUDE = '@"./edition/edition-index.aon"';
// aontu refuses a `.aon` include, so a legacy index line is rewritten in place,
// or dropped where the `.aontu` include is already present.
function entryWithIndex(model, append) {
    const lines = model.split('\n');
    const legacy = lines.findIndex(s => sameInclude(s, LEGACY_INDEX_INCLUDE));
    const current = lines.some(s => sameInclude(s, INDEX_INCLUDE));
    if (0 <= legacy) {
        if (current)
            lines.splice(legacy, 1);
        else
            lines[legacy] = lines[legacy].replace(/\.aon"/, '.aontu"');
        return lines.join('\n');
    }
    return current || !append ? model : model + '\n' + INDEX_INCLUDE + '\n';
}
// Once bootstrapped, only a legacy line is repaired, and only toward an index
// that exists: an include the project removed stays removed.
function repairEntryIndex(root) {
    const modelPath = modelEntryPath(root);
    if (!node_fs_1.default.existsSync(modelPath) ||
        !node_fs_1.default.existsSync((0, ledger_1.inside)(root, '.sdk/model/edition/edition-index.aontu', node_fs_1.default)))
        return;
    const model = node_fs_1.default.readFileSync(modelPath, 'utf8');
    const next = entryWithIndex(model, false);
    if (next !== model)
        node_fs_1.default.writeFileSync(modelPath, next);
}
function prepareProject(root) {
    root = node_path_1.default.resolve(root);
    const sdk = node_path_1.default.join(root, '.sdk');
    if (!node_fs_1.default.existsSync(sdk))
        throw new Error('Docgen requires an existing .sdk setup');
    const marker = (0, ledger_1.inside)(root, '.sdk/doc/setup.json', node_fs_1.default);
    if (node_fs_1.default.existsSync(marker)) {
        repairEntryIndex(root);
        return topUpEditionTemplates(root);
    }
    const defaults = scaffoldDefaults();
    const writes = {};
    for (const [rel, text] of Object.entries(defaults)) {
        const file = (0, ledger_1.inside)(root, '.sdk/' + rel, node_fs_1.default);
        if (rel.endsWith('edition-index.aontu')) {
            let index = node_fs_1.default.existsSync(file) ? node_fs_1.default.readFileSync(file, 'utf8') : '';
            for (const line of text.trim().split('\n'))
                if (!index.split('\n').some(s => sameInclude(s, line)))
                    index += '\n' + line + '\n';
            writes[file] = index;
        }
        else if (!node_fs_1.default.existsSync(file))
            writes[file] = text;
    }
    const modelPath = modelEntryPath(root);
    if (!node_fs_1.default.existsSync(modelPath))
        throw new Error('Docgen requires .sdk/model/sdk.aontu');
    const model = node_fs_1.default.readFileSync(modelPath, 'utf8'), entry = entryWithIndex(model, true);
    if (entry !== model)
        writes[modelPath] = entry;
    for (const [path, text] of Object.entries(writes)) {
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(path), { recursive: true });
        node_fs_1.default.writeFileSync(path, text);
    }
    node_fs_1.default.mkdirSync(node_path_1.default.dirname(marker), { recursive: true });
    node_fs_1.default.writeFileSync(marker, JSON.stringify({ version: 1 }) + '\n');
}
function topUpEditionTemplates(root) {
    for (const tree of ['src/cmp/edition/', 'tm/edition/']) {
        const packageTree = node_path_1.default.join(PACKAGE, 'project/.sdk', tree);
        if (!node_fs_1.default.existsSync(packageTree))
            continue;
        for (const name of node_fs_1.default.readdirSync(packageTree)) {
            const from = node_path_1.default.join(packageTree, name);
            if (!node_fs_1.default.statSync(from).isDirectory())
                continue;
            const into = node_path_1.default.join(root, '.sdk', tree, name);
            if (!node_fs_1.default.existsSync(into))
                continue;
            for (const file of walk(node_fs_1.default, from)) {
                const at = (0, ledger_1.inside)(root, '.sdk/' + tree + name + '/' + file, node_fs_1.default);
                if (node_fs_1.default.existsSync(at))
                    continue;
                node_fs_1.default.mkdirSync(node_path_1.default.dirname(at), { recursive: true });
                node_fs_1.default.writeFileSync(at, node_fs_1.default.readFileSync(node_path_1.default.join(from, file), 'utf8'));
            }
        }
    }
}
//# sourceMappingURL=docgen.js.map