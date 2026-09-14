"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.code = exports.cell = exports.prose = exports.html = void 0;
exports.fence = fence;
exports.rows = rows;
exports.view = view;
exports.surface = surface;
exports.installation = installation;
exports.summary = summary;
exports.pages = pages;
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
    const apiLink = (e) => link(e.Name, 'api/' + encodeURIComponent(e.name) + '.html', 'entities', e.name);
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
function operationText(op) {
    const lines = ['## ' + (0, exports.prose)(op.name), '', (0, exports.prose)(op.short || op.description || '')];
    for (const point of (op.points ?? []).filter((p) => p.active !== false)) {
        lines.push('', '### ' + (0, exports.prose)((point.method || '').toUpperCase() + ' ' + (point.orig || '')), '');
        const c = contract(point);
        if (c.parameters?.length)
            lines.push('#### Parameters', '', fieldsTable(c.parameters.map((p) => ({ ...p, type: p.schema?.type, name: p.name + ' (' + p.in + ')' }))), '');
        if (c.requestBody) {
            lines.push('#### Request body', '');
            for (const [mime, body] of Object.entries(c.requestBody.content ?? {})) {
                lines.push((0, exports.code)(mime), '', fence(JSON.stringify(body.schema ?? {}, null, 2)));
                if (body.example)
                    lines.push('Example request:', fence(JSON.stringify(body.example, null, 2)));
            }
        }
        if (c.responses) {
            lines.push('#### Responses', '');
            for (const [status, response] of Object.entries(c.responses)) {
                lines.push('##### ' + (0, exports.prose)(status), '', (0, exports.prose)(response.description || ''), '');
                for (const [mime, body] of Object.entries(response.content ?? {})) {
                    lines.push((0, exports.code)(mime), '', fence(JSON.stringify(body.schema ?? {}, null, 2)));
                }
            }
        }
        if (c.security)
            lines.push('#### Security requirements', fence(JSON.stringify(c.security, null, 2)));
    }
    return lines.join('\n');
}
function pages(v, examples = {}) {
    const out = [];
    const add = (path, title, group, body) => out.push({ path, title, group, markdown: '# ' + (0, exports.prose)(title) + '\n\n' + body + '\n' });
    add('index', v.title, 'Overview', (0, exports.prose)(v.description));
    const servers = v.info.servers ?? [];
    add('api/index', 'API overview', 'API', [(0, exports.prose)(v.info.summary || ''), '',
        ...servers.map((s) => '- ' + (0, exports.code)(s.url) + (s.description ? ': ' + (0, exports.prose)(s.description) : '')),
        '', ...v.entities.map(e => '- [' + (0, exports.prose)(e.Name) + '](' + encodeURIComponent(e.name) + '.html)')].join('\n'));
    add('guides/authentication', 'Authentication', 'Guides', v.info.security && Object.keys(v.info.security).length ?
        'Configure credentials for the scheme described by the API model. Keep credentials outside source control.\n' +
            fence(JSON.stringify(v.info.security, null, 2)) : 'No authentication scheme is documented.');
    const first = v.entities.flatMap(e => rows(e.op).flatMap(op => (op.points || []).map((p) => ({ e, op, p }))))[0];
    add('guides/first-call', 'Make your first API call', 'Guides', first ?
        '1. Choose an SDK from the SDK section and follow its installation instructions.\n' +
            '2. Configure the API server and authentication settings.\n' +
            '3. Open the [' + (0, exports.prose)(first.e.Name) + ' reference](../api/' + encodeURIComponent(first.e.name) + '.html) and supply the parameters and request body it requires.\n' +
            '4. Call ' + (0, exports.code)(first.op.name) + ' and inspect the returned entity data.\n\n' +
            'The first endpoint is ' + (0, exports.code)(first.p.method + ' ' + first.p.orig) + '. Request and response examples come from the model.' :
        'Add an active entity and operation to the API model to document a first call.');
    add('guides/errors', 'Handle errors', 'Guides', 'Check the status and error response documented for each operation. Handle authentication and validation failures before retrying a request.\n\n' +
        'Configure retry, timeout, and logging through the features present in the selected SDK. Review the feature reference for defaults and options.');
    add('guides/concepts', 'Entities, SDKs, and tools', 'Guides', 'The API model defines entities, operations, fields, and endpoint contracts. SDK targets expose those operations in a programming language. Additional targets expose a command interface, an MCP server, or a data integration.\n\n' +
        'SDKs expose the API operations using each language’s conventions. Read the language reference for configuration and return values.');
    for (const entity of v.entities) {
        add('api/' + encodeURIComponent(entity.name), entity.Name, 'API', [(0, exports.prose)(v.info.entity_desc?.[entity.name] || entity.desc || entity.short || ''), '',
            '## Fields', '', fieldsTable(entity.fields ?? []), '', ...rows(entity.op).map(operationText)].join('\n'));
    }
    for (const target of v.targets) {
        const kind = surface(target, v.kit), detail = v.kit.doc?.target?.[target.name] ?? {};
        const applicable = new Set(Object.keys((0, sdkgen_1.targetFeatures)(v.model, target.name)));
        const features = v.features.filter(f => applicable.has(f.name));
        const text = [(0, exports.prose)(detail.description || target.title || target.name), '', '## Install', '',
            (0, exports.prose)(installation(v.model, target)), '', '## Package', '', (0, exports.code)((0, sdkgen_1.packageName)(v.model, target.name)), '',
            '## API reference', '', ...(kind === 'mcp' ? ['The API reference covers all entities. The tools section lists the operations this server exposes.', ''] : []), '| Entity | Operations |', '| --- | --- |', ...v.entities.map(e => '| [' + (0, exports.cell)(e.Name) + '](../api/' + encodeURIComponent(e.name) + '.html) | ' + rows(e.op).map(op => (0, exports.code)(op.name)).join(', ') + ' |'),
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
    for (const feature of v.features)
        add('features/' + encodeURIComponent(feature.name), feature.title || feature.name, 'Features', [(0, exports.prose)(feature.description || feature.short || ''), '', '## Options', fence(JSON.stringify(feature.config?.options ?? {}, null, 2)),
            '## Pipeline stages', '', ...rows(feature.hook).map(h => '- ' + (0, exports.code)(h.name))].join('\n'));
    return out;
}
function slides(v, example = '') {
    const chunks = [(0, exports.prose)(v.title) + '\n\n' + (0, exports.prose)(v.info.summary || v.description) + (v.kit.doc?.brand?.notice ? '\n\n' + (0, exports.prose)(v.kit.doc.brand.notice) : ''),
        'API capabilities\n\n' + v.entities.map(e => '- ' + (0, exports.prose)(e.Name) + ': ' + rows(e.op).map(o => (0, exports.code)(o.name)).join(', ')).join('\n'),
        'Authentication\n\n' + (v.info.security?.type ? 'Use ' + (0, exports.code)(v.info.security.type) + ' authentication. Configure credentials outside source control.' : 'The model declares no authentication scheme.'),
        'Make your first call\n\n1. Install an SDK.\n2. Configure the server and credentials.\n3. Supply the operation’s required input.\n4. Inspect the response.'];
    for (let i = 0; i < v.targets.length; i += 5)
        chunks.push('SDKs and tools ' + (Math.floor(i / 5) + 1) + ' / ' + Math.ceil(v.targets.length / 5) + '\n\n' + v.targets.slice(i, i + 5)
            .map(t => '- ' + (0, exports.prose)(t.title || t.name) + ': ' + ((0, sdkgen_1.isPublished)(v.model, t.name) ? (0, exports.prose)(installation(v.model, t)) : 'build from ' + (0, exports.code)(t.name + '/'))).join('\n'));
    if (example)
        chunks.splice(4, 0, 'Set up a client\n\n' + example);
    chunks.push('Next steps\n\n- Follow the first-call guide.\n- Read the API and SDK reference.\n- Review the feature and tool documentation.');
    return chunks.map(c => '# ' + c).join('\n\n---\n\n') + '\n';
}
//# sourceMappingURL=content.js.map