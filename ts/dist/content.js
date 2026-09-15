"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.METHODS = exports.code = exports.cell = exports.prose = exports.html = void 0;
exports.entityPage = entityPage;
exports.fence = fence;
exports.rows = rows;
exports.repoLinkFor = repoLinkFor;
exports.specLink = specLink;
exports.view = view;
exports.surface = surface;
exports.installation = installation;
exports.summary = summary;
exports.slugFor = slugFor;
exports.typeName = typeName;
exports.pages = pages;
exports.slideBodies = slideBodies;
exports.slides = slides;
const sdk_reference_1 = require("./sdk-reference");
const jostraca_1 = require("jostraca");
const node_path_1 = __importDefault(require("node:path"));
const sdkgen_1 = require("@voxgig/sdkgen");
const html = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
exports.html = html;
const prose = (v) => (0, exports.html)(String(v ?? '').replace(/\be\.g\./gi, 'for example').replace(/\bi\.e\./gi, 'that is').replace(/\s*—\s*/g, ', ')).replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
exports.prose = prose;
const cell = (v) => (0, exports.prose)(v).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
exports.cell = cell;
const code = (v) => '`' + String(v ?? '').replace(/`/g, '') + '`';
exports.code = code;
// AN ENTITY PAGE PATH, which is not simply its encoded name.
//
// Entity pages live at `api/<name>.html`, and the API section's own landing page
// is `api/index.html`. An entity actually named `index` therefore claims the
// path the overview already owns, and generation dies with
//
//   Error: Duplicate documentation page: api/index
//
// Four of the 609 freepublicapis SDKs are built from specs carrying such an
// entity — 4chan's board `index` among them — so they could not be documented
// at all.
//
// THE LANDING PAGE CANNOT MOVE: `index.html` is what a web server returns for
// the directory. So the entity moves instead, and it moves in ONE place,
// because five call sites build this path and a page that moves without its
// links is worse than the collision it fixed.
//
// `api/` is the only section with a landing page, so it is the only section
// that can collide.
const RESERVED_API_PAGES = new Set(['index']);
function entityPage(name) {
    const slug = encodeURIComponent(name);
    return RESERVED_API_PAGES.has(slug) ? slug + '-entity' : slug;
}
function fence(text, language = 'json') {
    const marker = '`'.repeat(Math.max(3, ...Array.from(text.matchAll(/`+/g), m => m[0].length + 1)));
    return '\n' + marker + language.replace(/[^\w+-]/g, '') + '\n' + text + '\n' + marker + '\n';
}
function rows(map) {
    return Object.keys(map ?? {}).sort().filter(n => !n.includes('$'))
        .map(name => ({ ...map[name], name: map[name]?.name || name }))
        .filter(item => item.active !== false);
}
function pick(items, selected = []) {
    for (const n of selected)
        if (!items.some(i => i.name === n))
            throw new Error('Unknown or inactive documentation selection: ' + n);
    return selected.length ? items.filter(i => selected.includes(i.name)) : items;
}
// The SDK's own repository. sdkgen's `repoInfo` is THE implementation of the
// `main: kit: repo` rule (explicit path, else `<origin>/<name>-sdk`); it
// already decides the go module path and every manifest URL, so the website
// must not re-derive it — a link that disagrees with the published
// `repository` URL is worse than no link.
function repoLinkFor(model) {
    const info = (0, sdkgen_1.repoInfo)(model);
    return { url: info.repoUrl, path: info.path };
}
// The OpenAPI definition this SDK is generated from, at its canonical place
// in the repository: apidef resolves `def` against `.sdk/def/`. Returns ''
// when the model carries no definition, so a hand-built model links nothing
// rather than linking a 404.
function specLink(model) {
    const def = model?.def;
    if (!def || 'string' !== typeof def)
        return '';
    const branch = model?.main?.kit?.doc?.ci?.branch || 'main';
    return repoLinkFor(model).url + '/blob/' + encodeURIComponent(branch) +
        '/.sdk/def/' + encodeURIComponent(def);
}
function view(model, edition) {
    const kit = model.main.kit;
    const entities = pick(rows(kit.entity), edition.filter?.entities);
    const targets = pick(rows(kit.target), edition.filter?.targets);
    const features = pick(rows(kit.feature), edition.filter?.features);
    entities.forEach(e => (0, jostraca_1.names)(e, e.name));
    return { model, kit, edition, entities, targets, features, title: edition.title || kit.info?.title || model.name,
        description: kit.info?.description || kit.info?.summary || '', info: kit.info ?? {} };
}
function surface(target, kit) {
    return kit.doc?.target?.[target.name]?.kind ||
        { 'go-mcp': 'mcp', 'go-cli': 'cli', 'py-data': 'data' }[target.origname || target.name] || 'sdk';
}
function installation(model, target) {
    return model.main.kit.doc?.target?.[target.name]?.install || ((0, sdkgen_1.isPublished)(model, target.name) ? (0, sdkgen_1.installCommand)(model, target.name) : 'Not published. Build from the ' + target.name + ' directory.');
}
function summary(v) {
    const sdks = v.targets.filter(t => surface(t, v.kit) === 'sdk');
    const tools = v.targets.filter(t => surface(t, v.kit) !== 'sdk');
    const routes = v.entities.flatMap(entity => rows(entity.op).flatMap(op => (op.points ?? []).filter((p) => p.active !== false).map((point) => ({ entity, op, point, facts: contract(point) }))));
    const anonymous = (facts) => Array.isArray(facts.security) && (!facts.security.length || facts.security.some((s) => s && !Object.keys(s).length));
    const website = rows(v.kit.doc?.edition).find(e => e.kind === 'github-pages');
    const base = node_path_1.default.posix.dirname(v.edition.output?.path || 'SUMMARY.md');
    const link = (label, page, collection, name) => {
        const selected = website?.filter?.[collection || ''];
        if (!website || (selected?.length && !selected.includes(name)))
            return (0, exports.prose)(label);
        const href = node_path_1.default.posix.relative(base, website.output.path + '/' + page);
        return '[' + (0, exports.prose)(label) + '](' + href.split('/').map(encodeURIComponent).join('/') + ')';
    };
    const apiLink = (e) => link(e.Name, 'api/' + entityPage(e.name) + '.html', 'entities', e.name);
    const sdkLink = (t) => link(t.title || t.name, 'sdks/' + encodeURIComponent(t.name) + '.html', 'targets', t.name);
    const lines = ['# ' + (0, exports.prose)(v.title), '', (0, exports.prose)(v.description), '', '## Start here', '',
        'This guide introduces the API, the client libraries, and the companion tools in this repository. Start with the API capabilities, choose a client for your application, and use the linked reference when you need exact request and response details.', '',
        'The selected API surface contains ' + v.entities.length + ' entities and ' + routes.length + ' HTTP routes. ' +
            (sdks.length ? 'There are ' + sdks.length + ' SDK targets' + (tools.length ? ' and ' + tools.length + ' companion tools' : '') + '.' : 'No SDK targets are selected.'), '',
        'An entity groups related API operations. An operation can have several routes with different inputs or authentication requirements. The SDK exposes the entity and its operations using the conventions of the selected language.', '',
        '## What the API provides', ''];
    if (v.kit.doc?.brand?.notice)
        lines.splice(4, 0, (0, exports.prose)(v.kit.doc.brand.notice), '');
    for (const entity of v.entities) {
        const entityRoutes = routes.filter(r => r.entity.name === entity.name);
        const results = [...new Set(entityRoutes.flatMap(r => Object.entries(r.facts.responses || {})
                .filter(([status]) => /^2\d\d$/.test(status)).map(([, response]) => response.description).filter(Boolean)))];
        const description = v.info.entity_desc?.[entity.name] || entity.desc || entity.short;
        lines.push('### ' + apiLink(entity), '');
        if (description)
            lines.push((0, exports.prose)(description), '');
        if (results.length)
            lines.push('Results: ' + results.map(exports.prose).join('; ').replace(/[.]+$/, '') + '.', '');
        lines.push('SDK operations: ' + rows(entity.op).map(o => (0, exports.code)(o.name)).join(', ') + '.', '');
        const descriptions = {};
        const describe = (schema) => {
            if (!schema || typeof schema !== 'object')
                return;
            for (const [name, field] of Object.entries(schema.properties || {}))
                if (field.description && !descriptions[name])
                    descriptions[name] = field.description;
            Object.values(schema).forEach(value => { if (value && typeof value === 'object')
                describe(value); });
        };
        entityRoutes.forEach(r => describe(r.facts.responses));
        const fields = (entity.fields ?? []).filter((f) => f.active !== false && (f.short || f.description)).slice(0, 5);
        if (fields.length)
            lines.push('Key fields to recognise:', '', ...fields.map((f) => '- ' + (0, exports.code)(f.name) + ': ' + (0, exports.prose)(f.description || descriptions[f.name] || f.short)), '');
    }
    if (routes.length)
        lines.push('### Route map', '', 'Use this map to locate a capability. Consult the entity reference before supplying request data; routes for the same operation can require different fields.', '', '| Entity | SDK operation | HTTP route | Authentication |', '| --- | --- | --- | --- |', ...routes.map(r => '| ' + apiLink(r.entity) + ' | ' + (0, exports.code)(r.op.name) + ' | ' + (0, exports.code)(r.point.method.toUpperCase() + ' ' + r.point.orig) + ' | ' +
            (Array.isArray(r.facts.security) ? (anonymous(r.facts) ? 'Not required' : 'Required') : 'See reference') + ' |'), '');
    lines.push('## Connect to the API', '');
    for (const server of v.info.servers || [])
        lines.push('- ' + (0, exports.prose)(server.description || 'API server') + ': ' + (0, exports.code)(server.url));
    lines.push('');
    const security = v.info.security || {};
    if (security.name)
        lines.push('The default credential is sent in the ' + (0, exports.code)(security.name) + ' ' + (0, exports.prose)(security.in || 'header') +
            (security.prefix ? ' with the ' + (0, exports.code)(security.prefix) + ' prefix' : '') + '.', '');
    const authDescriptions = [...new Set(routes.flatMap(r => Object.values(r.facts.securitySchemes || {}).map(s => s.description).filter(Boolean)))];
    lines.push(...authDescriptions.flatMap(s => [(0, exports.prose)(s), '']));
    lines.push('Check authentication for the route you plan to call. A route that declares no authentication can be used without credentials; this does not change the requirements of other routes. Keep credentials in environment variables or a configured secret provider, and keep them out of source control and logs.', '', '## Make a first request', '', '1. Choose the API server and an operation that matches your task.', '2. Check the operation’s required input and authentication. Use values valid for your account and environment.', '3. Send one request and inspect the returned data before adding retries, concurrency, or a larger batch.', '');
    const first = routes.find(r => r.point.method.toUpperCase() === 'GET' && !/[{}]/.test(r.point.orig) &&
        anonymous(r.facts) && !r.facts.requestBody &&
        !(r.facts.parameters || []).some((p) => p.required));
    const server = v.info.servers?.[0]?.url;
    if (first && server && !/[{}]/.test(server)) {
        const url = server.replace(/\/$/, '') + '/' + first.point.orig.replace(/^\//, '');
        lines.push('A read request without required parameters or authentication is ' + (0, exports.code)(first.point.method + ' ' + first.point.orig) + '. For example:', fence('curl --fail-with-body --silent --show-error ' + "'" + url.replace(/'/g, "'\\''") + "'", 'sh'), 'Inspect the response using the ' + apiLink(first.entity) + ' reference. This checks the public route; authenticated operations need their own credentials and request data.', '');
    }
    lines.push('For an SDK call, install or build the chosen client, create a client instance with its documented configuration, and call the required entity operation. Language references describe the argument shape, asynchronous behaviour, and returned values.', '', '## Choose an SDK', '', 'Choose the language already used by your application or service. The clients represent the same API model, while package setup, naming, and return types follow each language. Check the selected client’s reference and tests before integrating it into an existing application.', '');
    if (sdks.length)
        lines.push('| Client | Repository directory | Distribution |', '| --- | --- | --- |', ...sdks.map(t => '| ' + sdkLink(t) + ' | ' + (0, exports.code)(t.name + '/') + ' | ' + ((0, sdkgen_1.isPublished)(v.model, t.name) ? (0, exports.cell)(installation(v.model, t)) : 'Build from source') + ' |'), '', 'Build-from-source entries are not marked as published in the project model. Follow the build instructions in that target’s README, then consume the resulting package using your language’s local dependency mechanism. Published entries give the installation command recorded for that client.', '');
    if (tools.length) {
        lines.push('## Companion tools', '', 'These targets provide another way to use the API. Their available commands or tools can cover a smaller set of operations than the client libraries.', '');
        for (const target of tools) {
            const kind = surface(target, v.kit), detail = v.kit.doc?.target?.[target.name];
            lines.push('### ' + link(target.title || target.name, 'tools/' + encodeURIComponent(target.name) + '.html', 'targets', target.name), '', (0, exports.prose)(detail?.description || { cli: 'Use the command-line interface for shell-based tasks and scripts.', mcp: 'Use the MCP server to expose supported API operations to an MCP client.', data: 'Use the data integration for analysis and notebook workflows.' }[kind] || target.title), '', 'Repository directory: ' + (0, exports.code)(target.name + '/') + '. ' + (0, exports.prose)(installation(v.model, target)), '');
            if (kind === 'mcp')
                for (const tool of (0, sdk_reference_1.toolContracts)(v.model, target, v.entities)) {
                    lines.push('- ' + (0, exports.code)(tool.name) + ': ' + (0, exports.prose)(tool.description) + (tool.supportedEntities ?
                        (tool.supportedEntities.length ? ' Supported entities: ' + tool.supportedEntities.map(exports.code).join(', ') + '.' : ' No active entity supports this operation.') : ''));
                }
            lines.push('');
        }
    }
    if (v.features.length)
        lines.push('## Operational features', '', 'Features supply behaviour around API calls, such as request handling, diagnostics, or local testing. Inclusion in this project does not mean a feature is enabled at runtime. Check the selected SDK’s supported features and configuration defaults, then enable the behaviour your application needs.', '', ...v.features.map(f => '- ' + link((0, exports.code)(f.name), 'features/' + encodeURIComponent(f.name) + '.html', 'features', f.name) + ': ' + (0, exports.prose)(f.title || f.description || f.name)), '', 'Start with the default client configuration. Add request limits and diagnostics as needed, test error paths, and review retry behaviour before using operations that change data. A retry can repeat an operation unless the API provides a suitable guarantee.', '');
    lines.push('## Continue with the documentation', '', '- Follow the ' + link('first-call guide', 'guides/first-call.html') + ' for the setup sequence.', '- Read the ' + link('authentication guide', 'guides/authentication.html') + ' before using protected routes.', '- Use the ' + link('API reference', 'api/index.html') + ' for request schemas, response formats, and status codes.', '- Check the chosen SDK or companion tool reference for its configuration and supported operations.', '');
    return lines.join('\n') + '\n';
}
function fieldsTable(fields) {
    return ['| Field | Type | Required | Description |', '| --- | --- | --- | --- |',
        ...fields.filter(f => f.active !== false).map(f => '| ' + (0, exports.code)(f.name) + ' | ' + (0, exports.code)(String(f.type || 'any').replace(/[`$]/g, '').toLowerCase()) + ' | ' +
            (f.req || f.required ? 'Yes' : 'No') + ' | ' + (0, exports.cell)(f.short || f.description || '') + ' |')].join('\n');
}
function contract(point) {
    if (!point.contract?.json)
        return {};
    try {
        return JSON.parse(point.contract.json);
    }
    catch {
        throw new Error('Invalid model contract: ' + point.contract.id);
    }
}
// SWAGGER-STYLE REFERENCE, GROUPED BY ENTITY (not by OpenAPI tag).
//
// Requests and responses used to print as raw JSON Schema dumps, which is the
// one thing a reader cannot skim: learning that `data.embeddings` is a
// required array of numbers meant parsing nested `properties` / `items` /
// `required` by eye. These helpers render the same schema as a property
// table, the shape every API reference a reader has already used presents.
//
// The grouping stays the ENTITY, because that is what the SDKs expose. A tag
// is a spec-authoring convention; `client.convert.create(...)` is what the
// reader actually calls, so the reference is organised the way the code is.
// How deep a nested schema is flattened before a row just names the type.
// A reference that unrolls a recursive schema forever is worse than one that
// says `object` and lets the linked specification answer the rest.
const SCHEMA_DEPTH = 4;
exports.METHODS = 'GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS';
// The slug the rendered heading will carry.
//
// EXPORTED because the markdown heading renderer computes the id and the
// sidebar computes the link, and a second copy of this rule is a broken
// anchor waiting to happen: the two must agree character for character.
function slugFor(text) {
    return String(text ?? '').toLowerCase()
        .replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-');
}
// A readable type for one schema node.
function typeName(schema) {
    if (!schema || 'object' !== typeof schema)
        return 'any';
    if (Array.isArray(schema.enum) && schema.enum.length) {
        return 'enum: ' + schema.enum.slice(0, 6).map((v) => String(v)).join(', ') +
            (6 < schema.enum.length ? ', ...' : '');
    }
    if ('array' === schema.type)
        return 'array of ' + typeName(schema.items);
    for (const key of ['oneOf', 'anyOf', 'allOf']) {
        const composed = schema[key];
        if (Array.isArray(composed) && composed.length) {
            return composed.map(typeName).join('allOf' === key ? ' and ' : ' or ');
        }
    }
    if (schema.type)
        return String(schema.type) + (schema.format ? ' (' + schema.format + ')' : '');
    return schema.properties ? 'object' : 'any';
}
// One row per property: nested objects flatten to dotted paths and array
// items to `name[]`, so a single table carries a whole response shape.
function schemaRows(schema, prefix = '', depth = 0) {
    if (!schema || 'object' !== typeof schema || SCHEMA_DEPTH < depth)
        return [];
    if ('array' === schema.type)
        return schemaRows(schema.items, prefix + '[].', depth);
    const properties = schema.properties;
    if (!properties || 'object' !== typeof properties)
        return [];
    const required = Array.isArray(schema.required) ? schema.required : [];
    const out = [];
    for (const [name, field] of Object.entries(properties)) {
        const path = prefix + name;
        out.push({
            name: path,
            type: typeName(field),
            required: required.includes(name),
            description: field?.description || field?.title || '',
        });
        const array = 'array' === field?.type;
        const nested = array ? field.items : field;
        if (nested?.properties)
            out.push(...schemaRows(nested, path + (array ? '[]' : '') + '.', depth + 1));
    }
    return out;
}
function schemaTable(schema) {
    const rows = schemaRows(schema);
    if (!rows.length)
        return '';
    return ['| Property | Type | Required | Description |', '| --- | --- | --- | --- |',
        ...rows.map(r => '| ' + (0, exports.code)(r.name) + ' | ' + (0, exports.code)(r.type) + ' | ' +
            (r.required ? 'Yes' : 'No') + ' | ' + (0, exports.cell)(r.description) + ' |')].join('\n');
}
// A media type block: the property table when the schema has properties, the
// bare type when it has none, and the specification's own example.
function bodyText(content, label) {
    const lines = [];
    for (const [mime, body] of Object.entries(content ?? {})) {
        lines.push((0, exports.code)(mime), '');
        const table = schemaTable(body?.schema);
        if (table)
            lines.push(table, '');
        else if (body?.schema)
            lines.push('The ' + label + ' is ' + (0, exports.code)(typeName(body.schema)) + '.', '');
        if (body?.example)
            lines.push('Example ' + label + ':', fence(JSON.stringify(body.example, null, 2)));
    }
    return lines;
}
// What a route needs, in words. The reference printed the raw `security`
// array, which tells a reader nothing they can act on.
function authText(c) {
    const security = c.security;
    if (!Array.isArray(security))
        return '';
    if (!security.length || security.some((s) => s && !Object.keys(s).length)) {
        return 'Authentication: not required.';
    }
    const schemes = c.securitySchemes || {};
    const named = [...new Set(security.flatMap((s) => Object.keys(s || {})))];
    if (!named.length)
        return 'Authentication: not required.';
    const describe = (name) => {
        const scheme = schemes[name] || {};
        const kind = 'http' === scheme.type && scheme.scheme ? String(scheme.scheme) + ' token' :
            'apiKey' === scheme.type ? 'API key in the ' + (scheme.in || 'header') :
                scheme.type ? String(scheme.type) : 'credential';
        return (0, exports.prose)(kind) + ' (' + (0, exports.code)(name) + ')';
    };
    return 'Authentication: ' + named.map(describe).join(' or ') + '.';
}
// What a route gives back on success. An OpenAPI operation need not carry a
// `summary`, and this one's do not, so an index column fed from `summary`
// was empty on every row. The 2xx response description is the fact the spec
// does record, and it answers the same question.
function succeeds(c) {
    for (const [status, response] of Object.entries(c?.responses ?? {})) {
        if (/^2\d\d$/.test(status))
            return String(response?.description || '').replace(/\.+$/, '');
    }
    return '';
}
function routesOf(entity) {
    return rows(entity.op).flatMap((op) => (op.points ?? []).filter((p) => p.active !== false).map((point) => {
        const method = String(point.method || '').toUpperCase();
        const path = String(point.orig || '');
        const heading = (0, exports.code)(method) + ' ' + path;
        return { op, point, method, path, heading, id: slugFor(heading), c: contract(point) };
    }));
}
// One entity page: the routes it exposes, its fields, then a reference
// section per route, each with its own anchor so the sidebar can link to it.
function entityReference(entity) {
    const routes = routesOf(entity);
    const lines = [];
    if (routes.length) {
        lines.push('## Operations', '', 'Every route this entity exposes. Each route links to its own reference on this page.', '', '| Method | Route | SDK operation | Returns |', '| --- | --- | --- | --- |', ...routes.map(r => '| ' + (0, exports.code)(r.method) + ' | [' + (0, exports.code)(r.path) + '](#' + r.id + ') | ' +
            (0, exports.code)(r.op.name) + ' | ' + (0, exports.cell)(r.op.short || r.op.description || succeeds(r.c)) + ' |'), '');
    }
    lines.push('## Fields', '', fieldsTable(entity.fields ?? []), '');
    for (const op of rows(entity.op)) {
        lines.push('## ' + (0, exports.prose)(op.name), '', (0, exports.prose)(op.short || op.description || ''), '');
        for (const r of routes.filter(x => x.op.name === op.name)) {
            lines.push('### ' + r.heading, '');
            if (r.c.operationId)
                lines.push('Operation ID: ' + (0, exports.code)(r.c.operationId) + '.', '');
            const auth = authText(r.c);
            if (auth)
                lines.push(auth, '');
            if (r.c.parameters?.length) {
                lines.push('#### Parameters', '', '| Parameter | In | Type | Required | Description |', '| --- | --- | --- | --- |', ...r.c.parameters.map((p) => '| ' + (0, exports.code)(p.name) + ' | ' + (0, exports.code)(p.in || '') + ' | ' +
                    (0, exports.code)(typeName(p.schema)) + ' | ' + (p.required ? 'Yes' : 'No') + ' | ' +
                    (0, exports.cell)(p.description || '') + ' |'), '');
            }
            if (r.c.requestBody) {
                lines.push('#### Request body', '', ...bodyText(r.c.requestBody.content, 'request body'));
            }
            const responses = r.c.responses;
            if (responses && Object.keys(responses).length) {
                lines.push('#### Responses', '');
                for (const [status, response] of Object.entries(responses)) {
                    const described = String(response?.description || '').replace(/\.+$/, '');
                    lines.push('##### ' + (0, exports.prose)(status) + (described ? ': ' + (0, exports.prose)(described) : ''), '');
                    lines.push(...bodyText(response?.content, 'response'));
                }
            }
        }
    }
    return {
        markdown: lines.join('\n'),
        sections: routes.map(r => ({ id: r.id, title: r.method + ' ' + r.path })),
    };
}
function pages(v, examples = {}) {
    const out = [];
    const add = (path, title, group, body) => out.push({ path, title, group, markdown: '# ' + (0, exports.prose)(title) + '\n\n' + body + '\n' });
    add('index', v.title, 'Overview', (0, exports.prose)(v.description));
    const servers = v.info.servers ?? [];
    const spec = specLink(v.model);
    add('api/index', 'API overview', 'API', [(0, exports.prose)(v.info.summary || ''), '',
        ...servers.map((s) => '- ' + (0, exports.code)(s.url) + (s.description ? ': ' + (0, exports.prose)(s.description) : '')),
        ...(spec ? ['', 'This documentation is generated from the [OpenAPI specification](' + spec + ') held in the SDK repository.'] : []),
        '', ...v.entities.map(e => '- [' + (0, exports.prose)(e.Name) + '](' + entityPage(e.name) + '.html)')].join('\n'));
    add('guides/authentication', 'Authentication', 'Guides', v.info.security && Object.keys(v.info.security).length ?
        'Configure credentials for the scheme described by the API model. Keep credentials outside source control.\n' +
            fence(JSON.stringify(v.info.security, null, 2)) : 'No authentication scheme is documented.');
    const first = v.entities.flatMap(e => rows(e.op).flatMap(op => (op.points || []).map((p) => ({ e, op, p }))))[0];
    add('guides/first-call', 'Make your first API call', 'Guides', first ?
        '1. Choose an SDK from the SDK section and follow its installation instructions.\n' +
            '2. Configure the API server and authentication settings.\n' +
            '3. Open the [' + (0, exports.prose)(first.e.Name) + ' reference](../api/' + entityPage(first.e.name) + '.html) and supply the parameters and request body it requires.\n' +
            '4. Call ' + (0, exports.code)(first.op.name) + ' and inspect the returned entity data.\n\n' +
            'The first endpoint is ' + (0, exports.code)(first.p.method + ' ' + first.p.orig) + '. Request and response examples come from the model.' :
        'Add an active entity and operation to the API model to document a first call.');
    add('guides/errors', 'Handle errors', 'Guides', 'Check the status and error response documented for each operation. Handle authentication and validation failures before retrying a request.\n\n' +
        'Configure retry, timeout, and logging through the features present in the selected SDK. Review the feature reference for defaults and options.');
    add('guides/concepts', 'Entities, SDKs, and tools', 'Guides', 'The API model defines entities, operations, fields, and endpoint contracts. SDK targets expose those operations in a programming language. Additional targets expose a command interface, an MCP server, or a data integration.\n\n' +
        'SDKs expose the API operations using each language’s conventions. Read the language reference for configuration and return values.');
    for (const entity of v.entities) {
        const reference = entityReference(entity);
        add('api/' + entityPage(entity.name), entity.Name, 'API', [(0, exports.prose)(v.info.entity_desc?.[entity.name] || entity.desc || entity.short || ''), '',
            reference.markdown].join('\n'));
        out[out.length - 1].sections = reference.sections;
    }
    for (const target of v.targets) {
        const kind = surface(target, v.kit), detail = v.kit.doc?.target?.[target.name] ?? {};
        const applicable = new Set(Object.keys((0, sdkgen_1.targetFeatures)(v.model, target.name)));
        const features = v.features.filter(f => applicable.has(f.name));
        const text = [(0, exports.prose)(detail.description || target.title || target.name), '', '## Install', '',
            (0, exports.prose)(installation(v.model, target)), '', '## Package', '', (0, exports.code)((0, sdkgen_1.packageName)(v.model, target.name)), '',
            '## API reference', '', ...(kind === 'mcp' ? ['The API reference covers all entities. The tools section lists the operations this server exposes.', ''] : []), '| Entity | Operations |', '| --- | --- |', ...v.entities.map(e => '| [' + (0, exports.cell)(e.Name) + '](../api/' + entityPage(e.name) + '.html) | ' + rows(e.op).map(op => (0, exports.code)(op.name)).join(', ') + ' |'),
            '', '## Configuration', '', 'Set the server URL and credentials for your environment. Enable only the features your application needs.',
            '', '## Features', '', ...features.map(f => '- [' + (0, exports.prose)(f.title || f.name) + '](../features/' + encodeURIComponent(f.name) + '.html)')];
        if (examples[target.name])
            text.push('', '## Set up the client', '', 'This setup fragment reads credentials from the environment. Use the API operation reference to supply input for each call.', '', fence(examples[target.name], detail.language || target.ext || target.name));
        if (kind === 'sdk')
            text.push('', '## Client defaults', '', fence(JSON.stringify((0, sdk_reference_1.clientDefaults)(v.model, target), null, 2)));
        if (kind === 'mcp') {
            text.push('', '## Tools', '');
            const tools = (0, sdk_reference_1.toolContracts)(v.model, target, v.entities);
            if (tools.length)
                for (const tool of tools) {
                    text.push('### ' + (0, exports.code)(tool.name), '', (0, exports.prose)(tool.description), fence(JSON.stringify(tool.input || {}, null, 2)));
                    if (tool.supportedEntities)
                        text.push(tool.supportedEntities.length ?
                            'Supported entities: ' + tool.supportedEntities.map(exports.code).join(', ') + '.' :
                            'This tool is registered, but no active entity supports ' + (0, exports.code)(tool.operation) + '.', '');
                }
            else
                text.push('No tool contracts are recorded in this target’s documentation model.');
        }
        add((kind === 'sdk' ? 'sdks/' : 'tools/') + encodeURIComponent(target.name), target.title || target.name, kind === 'sdk' ? 'SDKs' : 'Tools', text.join('\n'));
    }
    for (const feature of v.features) {
        // A HEADING WITH NOTHING UNDER IT IS A BUG, not a blank line.
        //
        // `rows` drops entries marked `active: false`, which is right — an inactive
        // hook is not part of the pipeline. But the headings were emitted
        // unconditionally, so a feature that is itself ENABLED while every one of
        // its hooks is off rendered "## Pipeline stages" followed by nothing.
        // univec's `proxy` is exactly that: active feature, 11 declared hooks, 0 of
        // them active, and a published page with an empty section.
        //
        // Say so instead, which is what this file already does for an absent
        // security scheme and an absent first call. A reader asking whether proxy
        // hooks into the pipeline then gets an answer rather than silence.
        const stages = rows(feature.hook);
        const options = feature.config?.options ?? {};
        // A FEATURE PAGE HAS TO EXPLAIN ITSELF.
        //
        // It used to be a one-line description, a bare JSON blob, and two headings:
        // a reader who did not already know what a feature was, whether it was on,
        // or what a "pipeline stage" meant got no help from the page. Each section
        // now says what it is and what to do with it, which costs three sentences
        // and makes the page readable on its own.
        add('features/' + encodeURIComponent(feature.name), feature.title || feature.name, 'Features', [(0, exports.prose)(feature.description || feature.short || ''), '',
            'A feature adds behaviour around API calls without changing how you call the API.'
                + ' Being documented here does not mean it is switched on: features are off by'
                + ' default, and you enable the ones your application needs when you construct the'
                + ' client.', '',
            '## Options', '',
            ...(0 < Object.keys(options).length
                ? ['The settings this feature reads, with the defaults compiled into the SDK.'
                        + ' Pass replacements in the client configuration to change them; set'
                        + ' ' + (0, exports.code)('active') + ' to turn the feature on.', '',
                    fence(JSON.stringify(options, null, 2))]
                : ['This feature takes no configuration options.']),
            '', '## Pipeline stages', '',
            ...(0 < stages.length
                ? ['The points in the request lifecycle where this feature runs. The SDK calls'
                        + ' each stage in order as it prepares a request, sends it, and handles the'
                        + ' response.', '',
                    ...stages.map(h => '- ' + (0, exports.code)(h.name))]
                : ['No pipeline stages are enabled for this feature.'])].join('\n'));
    }
    return out;
}
// The slide bodies, one string per slide, WITHOUT the leading `# `.
//
// Separate from slides() so the deck's content can be asserted slide by slide
// rather than by matching against one joined string.
//
// THREE ACTS, in the order someone meets the SDK:
//
//   1. What it gives you   the API surface, the authentication, the features
//                          that come built in, and the languages it ships in.
//   2. A tutorial          install, construct a client, make one real call,
//                          handle the failure, turn a feature on.
//   3. Extending it        the SDK is generated, so the interesting question
//                          is what you can regenerate and what survives it.
//
// It used to be a flat list: capabilities, then authentication, then four
// generic instructions that named no operation and showed no code, then five
// slides of install commands. A reader reached the end knowing the API existed
// and not one thing they could type.
//
// Everything here comes from the model. A deck for an API with no entities, no
// features or no targets drops those slides rather than asserting something
// the model does not say.
function slideBodies(v, example = '') {
    const chunks = [];
    const group = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));
    const titled = (label, parts) => parts.forEach((part, i) => chunks.push(label + (1 < parts.length ? ' ' + (i + 1) + ' / ' + parts.length : '') + '\n\n' + part.join('\n')));
    const sdks = v.targets.filter(t => 'sdk' === surface(t, v.kit));
    const tools = v.targets.filter(t => 'sdk' !== surface(t, v.kit));
    const routes = v.entities.flatMap(e => rows(e.op).flatMap(op => (op.points ?? []).filter((p) => false !== p.active)));
    // The one operation the tutorial walks through. First entity, first
    // operation, first route: the same choice the first-call guide makes, so the
    // deck and the website teach the same call.
    const first = v.entities.flatMap(e => rows(e.op).flatMap(op => (op.points || []).map((p) => ({ e, op, p }))))[0];
    const primary = sdks.find(t => 'ts' === (t.origname || t.name)) || sdks[0];
    // --- ACT ONE: what the SDK gives you --------------------------------------
    chunks.push((0, exports.prose)(v.title) + '\n\n' + (0, exports.prose)(v.info.summary || v.description) +
        (v.kit.doc?.brand?.notice ? '\n\n' + (0, exports.prose)(v.kit.doc.brand.notice) : ''));
    // A deck for a one-entity API should not read "1 entities across 1 HTTP
    // routes". The counts are the model's, so they are as small as the model is.
    const many = (n, one, more = one + 's') => n + ' ' + (1 === n ? one : more);
    const scale = [
        v.entities.length ? '- ' + many(v.entities.length, 'entity', 'entities') + ' across ' + many(routes.length, 'HTTP route') : '',
        sdks.length ? '- ' + many(sdks.length, 'language SDK') + (tools.length ? ' and ' + many(tools.length, 'companion tool') : '') : '',
        v.features.length ? '- ' + many(v.features.length, 'optional feature') + ' built in, all off until you enable them' : '',
    ].filter(Boolean);
    chunks.push('What this SDK gives you\n\n' + (scale.length ? scale.join('\n') + '\n\n' : '') +
        'An entity groups related operations, and each operation may cover several routes. ' +
        'The SDK exposes both using the conventions of your language, so you write ' +
        (first ? (0, exports.code)('client') + ' calls rather than HTTP requests.' : 'code rather than HTTP requests.'));
    if (v.entities.length)
        titled('API capabilities', group(v.entities.map(e => '- ' + (0, exports.prose)(e.Name) + ': ' + rows(e.op).map(o => (0, exports.code)(o.name)).join(', ')), 6));
    chunks.push('Authentication\n\n' + (v.info.security?.type
        ? 'The API uses ' + (0, exports.code)(v.info.security.type) + ' authentication. Pass the credential when you construct the client, and read it from the environment rather than from source.'
        : 'The API model declares no authentication scheme, so no credential is required.'));
    if (v.features.length) {
        chunks.push('Features come with the SDK\n\n' +
            'Retries, caching, paging, logging and the rest are compiled in and switched off. ' +
            'You turn on the ones your application needs in the client configuration, and pay for nothing you leave alone.');
        titled('Built-in features', group(v.features.map(f => '- ' + (0, exports.prose)(f.title || f.name)), 8));
    }
    if (v.targets.length)
        titled('SDKs and tools', group(v.targets.map(t => '- ' + (0, exports.prose)(t.title || t.name) + ': ' +
            ((0, sdkgen_1.isPublished)(v.model, t.name) ? (0, exports.prose)(installation(v.model, t)) : 'build from ' + (0, exports.code)(t.name + '/'))), 5));
    // --- ACT TWO: the tutorial ------------------------------------------------
    if (primary && example) {
        const lang = primary.origname || primary.name;
        chunks.push('Tutorial: your first call\n\n' +
            'Five steps, in ' + (0, exports.prose)(primary.title || primary.name) + '. Every other language in this repository follows the same shape.\n\n' +
            '1. Install the SDK.\n2. Construct a client.\n3. Call an operation.\n4. Handle the failure.\n5. Turn on a feature.');
        chunks.push('Step 1: install\n\n' + ((0, sdkgen_1.isPublished)(v.model, primary.name)
            ? fence(installation(v.model, primary), 'sh').trim()
            : 'This target is not published yet. Build it from ' + (0, exports.code)(primary.name + '/') + ' in the repository.'));
        chunks.push('Step 2: construct a client\n\n' + example.trim() + '\n\n' +
            'The credential is read from the environment, so nothing secret reaches your source tree.');
        if (first) {
            // The dotted form is sdkgen's own: an entity accessor, then the
            // operation. Emitted for ts and js only, the two targets whose generated
            // shape this is verified against; every other language gets the same
            // fact in prose, which is true everywhere.
            const call = ['ts', 'js'].includes(lang)
                ? fence('const result = await client.' + first.e.Name + '().' + first.op.name + '({\n  // the input this operation requires\n})', lang).trim()
                : 'Call ' + (0, exports.code)(first.op.name) + ' on the ' + (0, exports.prose)(first.e.Name) + ' entity.';
            chunks.push('Step 3: call an operation\n\n' + call + '\n\n' +
                'That reaches ' + (0, exports.code)(first.p.method + ' ' + first.p.orig) + '. The reference page for ' +
                (0, exports.prose)(first.e.Name) + ' lists every field it expects.');
            chunks.push('Step 4: handle the failure\n\n' + (['ts', 'js'].includes(lang)
                ? fence('try {\n  const result = await client.' + first.e.Name + '().' + first.op.name + '({ /* input */ })\n} catch (err) {\n  // authentication, validation, or the API itself\n}', lang).trim()
                : 'Operations signal failure the way your language expects. Handle authentication and validation errors before retrying.') + '\n\n' +
                'Operations fail loudly rather than returning an empty result, so an error is never mistaken for no data.');
        }
        const retry = v.features.find(f => 'retry' === f.name) || v.features[0];
        if (retry)
            chunks.push('Step 5: turn on a feature\n\n' +
                fence('{ "' + retry.name + '": { "active": true } }').trim() + '\n\n' +
                'Pass that in the client configuration and ' + (0, exports.prose)(retry.title || retry.name).toLowerCase() +
                ' is live. The feature pages document every option and its default.');
    }
    // --- ACT THREE: extending it with sdkgen ----------------------------------
    const spec = specLink(v.model);
    chunks.push('This SDK is generated\n\n' +
        'Nothing here was written by hand. An API definition goes in, and every language, test suite and page of documentation comes out.\n\n' +
        'So the useful question is not how to patch it. It is what to regenerate, and what survives when you do.');
    chunks.push('Regenerate it\n\n' + fence('npm run generate', 'sh').trim() + '\n\n' +
        (spec ? 'Update the API definition in ' + (0, exports.code)('.sdk/def/') + ' and regenerate. ' : 'Update the API definition and regenerate. ') +
        'New routes, new fields and new entities reach every target at once.');
    chunks.push('Add a language\n\n' + fence('voxgig-sdkgen target add <language>', 'sh').trim() + '\n\n' +
        (1 < sdks.length ? 'This repository already builds ' + sdks.length + ' of them. ' : '') +
        'A target added today is generated from the same model as the ones already here, so it arrives complete rather than as a stub.');
    chunks.push('Add a feature\n\n' + fence('voxgig-sdkgen feature add <feature>', 'sh').trim() + '\n\n' +
        'A feature is behaviour around the call, not a change to it: retries, caching, audit trails, secret resolution. ' +
        'It lands in every target that supports it.');
    chunks.push('What survives a regeneration\n\n' +
        '- ' + (0, exports.code)('.sdk/model/project.aon') + ' is yours. Settings belong there.\n' +
        '- Everything generated is overwritten, every time.\n\n' +
        'An edit to a generated file works until the next regeneration and then disappears without warning, which is the one failure mode worth knowing in advance.');
    const next = ['- Read the API reference for the operation you need.',
        '- Pick a language and follow its installation page.',
        v.features.length ? '- Review the feature pages before enabling anything in production.' : ''];
    chunks.push('Where to go next\n\n' + next.filter(Boolean).join('\n'));
    return chunks;
}
function slides(v, example = '') {
    return slideBodies(v, example).map(c => '# ' + c).join('\n\n---\n\n') + '\n';
}
//# sourceMappingURL=content.js.map