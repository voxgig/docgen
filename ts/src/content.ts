import { clientDefaults, toolContracts } from './sdk-reference'
import { names } from 'jostraca'
import Path from 'node:path'
import { installCommand, packageName, isPublished, targetFeatures, repoInfo } from '@voxgig/sdkgen'

export type Page = { path: string, title: string, group: string, markdown: string, sections?: Section[] }
export const html = (v: any): string => String(v ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
export const prose = (v: any): string => html(String(v ?? '').replace(/\be\.g\./gi, 'for example').replace(/\bi\.e\./gi, 'that is').replace(/\s*—\s*/g, ', ')).replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
export const cell = (v: any): string => prose(v).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ')
export const code = (v: any): string => '`' + String(v ?? '').replace(/`/g, '') + '`'
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
const RESERVED_API_PAGES = new Set(['index'])

export function entityPage(name: string): string {
  const slug = encodeURIComponent(name)
  return RESERVED_API_PAGES.has(slug) ? slug + '-entity' : slug
}


export function fence(text: string, language = 'json'): string {
  const marker = '`'.repeat(Math.max(3, ...Array.from(text.matchAll(/`+/g), m => m[0].length + 1)))
  return '\n' + marker + language.replace(/[^\w+-]/g, '') + '\n' + text + '\n' + marker + '\n'
}
export function rows(map: any): any[] {
  return Object.keys(map ?? {}).sort().filter(n => !n.includes('$'))
    .map(name => ({ ...map[name], name: map[name]?.name || name }))
    .filter(item => item.active !== false)
}
function pick(items: any[], selected: string[] = []): any[] {
  for (const n of selected) if (!items.some(i => i.name === n)) throw new Error('Unknown or inactive documentation selection: ' + n)
  return selected.length ? items.filter(i => selected.includes(i.name)) : items
}
// The SDK's own repository. sdkgen's `repoInfo` is THE implementation of the
// `main: kit: repo` rule (explicit path, else `<origin>/<name>-sdk`); it
// already decides the go module path and every manifest URL, so the website
// must not re-derive it — a link that disagrees with the published
// `repository` URL is worse than no link.
export function repoLinkFor(model: any): { url: string, path: string } {
  const info: any = repoInfo(model)
  return { url: info.repoUrl, path: info.path }
}

// The OpenAPI definition this SDK is generated from, at its canonical place
// in the repository: apidef resolves `def` against `.sdk/def/`. Returns ''
// when the model carries no definition, so a hand-built model links nothing
// rather than linking a 404.
export function specLink(model: any): string {
  const def = model?.def
  if (!def || 'string' !== typeof def) return ''
  const branch = model?.main?.kit?.doc?.ci?.branch || 'main'
  return repoLinkFor(model).url + '/blob/' + encodeURIComponent(branch) +
    '/.sdk/def/' + encodeURIComponent(def)
}

export function view(model: any, edition: any) {
  const kit = model.main.kit
  const entities = pick(rows(kit.entity), edition.filter?.entities)
  const targets = pick(rows(kit.target), edition.filter?.targets)
  const features = pick(rows(kit.feature), edition.filter?.features)
  entities.forEach(e => names(e, e.name))
  return { model, kit, edition, entities, targets, features, title: edition.title || kit.info?.title || model.name,
    description: kit.info?.description || kit.info?.summary || '', info: kit.info ?? {} }
}
export function surface(target: any, kit: any): string {
  return kit.doc?.target?.[target.name]?.kind ||
    ({ 'go-mcp': 'mcp', 'go-cli': 'cli', 'py-data': 'data' } as any)[target.origname || target.name] || 'sdk'
}
export function installation(model: any, target: any): string {
  return model.main.kit.doc?.target?.[target.name]?.install || (isPublished(model, target.name) ? installCommand(model, target.name) : 'Not published. Build from the ' + target.name + ' directory.')
}
export function summary(v: ReturnType<typeof view>): string {
  const sdks = v.targets.filter(t => surface(t, v.kit) === 'sdk')
  const tools = v.targets.filter(t => surface(t, v.kit) !== 'sdk')
  const routes = v.entities.flatMap(entity => rows(entity.op).flatMap(op =>
    (op.points ?? []).filter((p: any) => p.active !== false).map((point: any) => ({ entity, op, point, facts: contract(point) }))))
  const anonymous = (facts: any) => Array.isArray(facts.security) && (!facts.security.length || facts.security.some((s: any) => s && !Object.keys(s).length))
  const website = rows(v.kit.doc?.edition).find(e => e.kind === 'github-pages')
  const base = Path.posix.dirname(v.edition.output?.path || 'SUMMARY.md')
  const link = (label: string, page: string, collection?: string, name?: string) => {
    const selected = website?.filter?.[collection || '']
    if (!website || (selected?.length && !selected.includes(name))) return prose(label)
    const href = Path.posix.relative(base, website.output.path + '/' + page)
    return '[' + prose(label) + '](' + href.split('/').map(encodeURIComponent).join('/') + ')'
  }
  const apiLink = (e: any) => link(e.Name, 'api/' + entityPage(e.name) + '.html', 'entities', e.name)
  const sdkLink = (t: any) => link(t.title || t.name, 'sdks/' + encodeURIComponent(t.name) + '.html', 'targets', t.name)
  const lines = ['# ' + prose(v.title), '', prose(v.description), '', '## Start here', '',
    'This guide introduces the API, the client libraries, and the companion tools in this repository. Start with the API capabilities, choose a client for your application, and use the linked reference when you need exact request and response details.', '',
    'The selected API surface contains ' + v.entities.length + ' entities and ' + routes.length + ' HTTP routes. ' +
      (sdks.length ? 'There are ' + sdks.length + ' SDK targets' + (tools.length ? ' and ' + tools.length + ' companion tools' : '') + '.' : 'No SDK targets are selected.'), '',
    'An entity groups related API operations. An operation can have several routes with different inputs or authentication requirements. The SDK exposes the entity and its operations using the conventions of the selected language.', '',
    '## What the API provides', '']
  if (v.kit.doc?.brand?.notice) lines.splice(4, 0, prose(v.kit.doc.brand.notice), '')
  for (const entity of v.entities) {
    const entityRoutes = routes.filter(r => r.entity.name === entity.name)
    const results = [...new Set<string>(entityRoutes.flatMap(r => Object.entries<any>(r.facts.responses || {})
      .filter(([status]) => /^2\d\d$/.test(status)).map(([,response]) => response.description).filter(Boolean)))]
    const description = v.info.entity_desc?.[entity.name] || entity.desc || entity.short
    lines.push('### ' + apiLink(entity), '')
    if (description) lines.push(prose(description), '')
    if (results.length) lines.push('Results: ' + results.map(prose).join('; ').replace(/[.]+$/, '') + '.', '')
    lines.push('SDK operations: ' + rows(entity.op).map(o => code(o.name)).join(', ') + '.', '')
    const descriptions: Record<string, string> = {}
    const describe = (schema: any) => {
      if (!schema || typeof schema !== 'object') return
      for (const [name, field] of Object.entries<any>(schema.properties || {})) if (field.description && !descriptions[name]) descriptions[name] = field.description
      Object.values(schema).forEach(value => { if (value && typeof value === 'object') describe(value) })
    }
    entityRoutes.forEach(r => describe(r.facts.responses))
    const fields = (entity.fields ?? []).filter((f: any) => f.active !== false && (f.short || f.description)).slice(0, 5)
    if (fields.length) lines.push('Key fields to recognise:', '', ...fields.map((f: any) => '- ' + code(f.name) + ': ' + prose(f.description || descriptions[f.name] || f.short)), '')
  }
  if (routes.length) lines.push('### Route map', '',
    'Use this map to locate a capability. Consult the entity reference before supplying request data; routes for the same operation can require different fields.', '',
    '| Entity | SDK operation | HTTP route | Authentication |', '| --- | --- | --- | --- |',
    ...routes.map(r => '| ' + apiLink(r.entity) + ' | ' + code(r.op.name) + ' | ' + code(r.point.method.toUpperCase() + ' ' + r.point.orig) + ' | ' +
      (Array.isArray(r.facts.security) ? (anonymous(r.facts) ? 'Not required' : 'Required') : 'See reference') + ' |'), '')
  lines.push('## Connect to the API', '')
  for (const server of v.info.servers || []) lines.push('- ' + prose(server.description || 'API server') + ': ' + code(server.url))
  lines.push('')
  const security = v.info.security || {}
  if (security.name) lines.push('The default credential is sent in the ' + code(security.name) + ' ' + prose(security.in || 'header') +
    (security.prefix ? ' with the ' + code(security.prefix) + ' prefix' : '') + '.', '')
  const authDescriptions = [...new Set<string>(routes.flatMap(r => Object.values<any>(r.facts.securitySchemes || {}).map(s => s.description).filter(Boolean)))]
  lines.push(...authDescriptions.flatMap(s => [prose(s), '']))
  lines.push('Check authentication for the route you plan to call. A route that declares no authentication can be used without credentials; this does not change the requirements of other routes. Keep credentials in environment variables or a configured secret provider, and keep them out of source control and logs.', '',
    '## Make a first request', '',
    '1. Choose the API server and an operation that matches your task.',
    '2. Check the operation’s required input and authentication. Use values valid for your account and environment.',
    '3. Send one request and inspect the returned data before adding retries, concurrency, or a larger batch.', '')
  const first = routes.find(r => r.point.method.toUpperCase() === 'GET' && !/[{}]/.test(r.point.orig) &&
    anonymous(r.facts) && !r.facts.requestBody &&
    !(r.facts.parameters || []).some((p: any) => p.required))
  const server = v.info.servers?.[0]?.url
  if (first && server && !/[{}]/.test(server)) {
    const url = server.replace(/\/$/, '') + '/' + first.point.orig.replace(/^\//, '')
    lines.push('A read request without required parameters or authentication is ' + code(first.point.method + ' ' + first.point.orig) + '. For example:',
      fence('curl --fail-with-body --silent --show-error ' + "'" + url.replace(/'/g, "'\\''") + "'", 'sh'),
      'Inspect the response using the ' + apiLink(first.entity) + ' reference. This checks the public route; authenticated operations need their own credentials and request data.', '')
  }
  lines.push('For an SDK call, install or build the chosen client, create a client instance with its documented configuration, and call the required entity operation. Language references describe the argument shape, asynchronous behaviour, and returned values.', '',
    '## Choose an SDK', '',
    'Choose the language already used by your application or service. The clients represent the same API model, while package setup, naming, and return types follow each language. Check the selected client’s reference and tests before integrating it into an existing application.', '')
  if (sdks.length) lines.push('| Client | Repository directory | Distribution |', '| --- | --- | --- |',
    ...sdks.map(t => '| ' + sdkLink(t) + ' | ' + code(t.name + '/') + ' | ' + (isPublished(v.model, t.name) ? cell(installation(v.model, t)) : 'Build from source') + ' |'), '',
    'Build-from-source entries are not marked as published in the project model. Follow the build instructions in that target’s README, then consume the resulting package using your language’s local dependency mechanism. Published entries give the installation command recorded for that client.', '')
  if (tools.length) {
    lines.push('## Companion tools', '', 'These targets provide another way to use the API. Their available commands or tools can cover a smaller set of operations than the client libraries.', '')
    for (const target of tools) {
      const kind = surface(target, v.kit), detail = v.kit.doc?.target?.[target.name]
      lines.push('### ' + link(target.title || target.name, 'tools/' + encodeURIComponent(target.name) + '.html', 'targets', target.name), '',
        prose(detail?.description || ({ cli: 'Use the command-line interface for shell-based tasks and scripts.', mcp: 'Use the MCP server to expose supported API operations to an MCP client.', data: 'Use the data integration for analysis and notebook workflows.' } as any)[kind] || target.title), '',
        'Repository directory: ' + code(target.name + '/') + '. ' + prose(installation(v.model, target)), '')
      if (kind === 'mcp') for (const tool of toolContracts(v.model, target, v.entities)) {
        lines.push('- ' + code(tool.name) + ': ' + prose(tool.description) + (tool.supportedEntities ?
          (tool.supportedEntities.length ? ' Supported entities: ' + tool.supportedEntities.map(code).join(', ') + '.' : ' No active entity supports this operation.') : ''))
      }
      lines.push('')
    }
  }
  if (v.features.length) lines.push('## Operational features', '',
    'Features supply behaviour around API calls, such as request handling, diagnostics, or local testing. Inclusion in this project does not mean a feature is enabled at runtime. Check the selected SDK’s supported features and configuration defaults, then enable the behaviour your application needs.', '',
    ...v.features.map(f => '- ' + link(code(f.name), 'features/' + encodeURIComponent(f.name) + '.html', 'features', f.name) + ': ' + prose(f.title || f.description || f.name)), '',
    'Start with the default client configuration. Add request limits and diagnostics as needed, test error paths, and review retry behaviour before using operations that change data. A retry can repeat an operation unless the API provides a suitable guarantee.', '')
  lines.push('## Continue with the documentation', '',
    '- Follow the ' + link('first-call guide', 'guides/first-call.html') + ' for the setup sequence.',
    '- Read the ' + link('authentication guide', 'guides/authentication.html') + ' before using protected routes.',
    '- Use the ' + link('API reference', 'api/index.html') + ' for request schemas, response formats, and status codes.',
    '- Check the chosen SDK or companion tool reference for its configuration and supported operations.', '')
  return lines.join('\n') + '\n'
}
function fieldsTable(fields: any[]): string {
  return ['| Field | Type | Required | Description |', '| --- | --- | --- | --- |',
    ...fields.filter(f => f.active !== false).map(f => '| ' + code(f.name) + ' | ' + code(String(f.type || 'any').replace(/[`$]/g, '').toLowerCase()) + ' | ' +
      (f.req || f.required ? 'Yes' : 'No') + ' | ' + cell(f.short || f.description || '') + ' |')].join('\n')
}
function contract(point: any): any {
  if (!point.contract?.json) return {}
  try { return JSON.parse(point.contract.json) } catch { throw new Error('Invalid model contract: ' + point.contract.id) }
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
const SCHEMA_DEPTH = 4

export const METHODS = 'GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS'

export type Section = { id: string, title: string }


// The slug the rendered heading will carry.
//
// EXPORTED because the markdown heading renderer computes the id and the
// sidebar computes the link, and a second copy of this rule is a broken
// anchor waiting to happen: the two must agree character for character.
export function slugFor(text: string): string {
  return String(text ?? '').toLowerCase()
    .replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-')
}


// A readable type for one schema node.
export function typeName(schema: any): string {
  if (!schema || 'object' !== typeof schema) return 'any'
  if (Array.isArray(schema.enum) && schema.enum.length) {
    return 'enum: ' + schema.enum.slice(0, 6).map((v: any) => String(v)).join(', ') +
      (6 < schema.enum.length ? ', ...' : '')
  }
  if ('array' === schema.type) return 'array of ' + typeName(schema.items)
  for (const key of ['oneOf', 'anyOf', 'allOf']) {
    const composed = schema[key]
    if (Array.isArray(composed) && composed.length) {
      return composed.map(typeName).join('allOf' === key ? ' and ' : ' or ')
    }
  }
  if (schema.type) return String(schema.type) + (schema.format ? ' (' + schema.format + ')' : '')
  return schema.properties ? 'object' : 'any'
}


type SchemaRow = { name: string, type: string, required: boolean, description: string }

// One row per property: nested objects flatten to dotted paths and array
// items to `name[]`, so a single table carries a whole response shape.
function schemaRows(schema: any, prefix = '', depth = 0): SchemaRow[] {
  if (!schema || 'object' !== typeof schema || SCHEMA_DEPTH < depth) return []
  if ('array' === schema.type) return schemaRows(schema.items, prefix + '[].', depth)
  const properties = schema.properties
  if (!properties || 'object' !== typeof properties) return []
  const required: string[] = Array.isArray(schema.required) ? schema.required : []
  const out: SchemaRow[] = []
  for (const [name, field] of Object.entries<any>(properties)) {
    const path = prefix + name
    out.push({
      name: path,
      type: typeName(field),
      required: required.includes(name),
      description: field?.description || field?.title || '',
    })
    const array = 'array' === field?.type
    const nested = array ? field.items : field
    if (nested?.properties) out.push(...schemaRows(nested, path + (array ? '[]' : '') + '.', depth + 1))
  }
  return out
}


function schemaTable(schema: any): string {
  const rows = schemaRows(schema)
  if (!rows.length) return ''
  return ['| Property | Type | Required | Description |', '| --- | --- | --- | --- |',
    ...rows.map(r => '| ' + code(r.name) + ' | ' + code(r.type) + ' | ' +
      (r.required ? 'Yes' : 'No') + ' | ' + cell(r.description) + ' |')].join('\n')
}


// A media type block: the property table when the schema has properties, the
// bare type when it has none, and the specification's own example.
function bodyText(content: any, label: string): string[] {
  const lines: string[] = []
  for (const [mime, body] of Object.entries<any>(content ?? {})) {
    lines.push(code(mime), '')
    const table = schemaTable(body?.schema)
    if (table) lines.push(table, '')
    else if (body?.schema) lines.push('The ' + label + ' is ' + code(typeName(body.schema)) + '.', '')
    if (body?.example) lines.push('Example ' + label + ':', fence(JSON.stringify(body.example, null, 2)))
  }
  return lines
}


// What a route needs, in words. The reference printed the raw `security`
// array, which tells a reader nothing they can act on.
function authText(c: any): string {
  const security = c.security
  if (!Array.isArray(security)) return ''
  if (!security.length || security.some((s: any) => s && !Object.keys(s).length)) {
    return 'Authentication: not required.'
  }
  const schemes = c.securitySchemes || {}
  const named = [...new Set<string>(security.flatMap((s: any) => Object.keys(s || {})))]
  if (!named.length) return 'Authentication: not required.'
  const describe = (name: string) => {
    const scheme = schemes[name] || {}
    const kind =
      'http' === scheme.type && scheme.scheme ? String(scheme.scheme) + ' token' :
      'apiKey' === scheme.type ? 'API key in the ' + (scheme.in || 'header') :
      scheme.type ? String(scheme.type) : 'credential'
    return prose(kind) + ' (' + code(name) + ')'
  }
  return 'Authentication: ' + named.map(describe).join(' or ') + '.'
}


// What a route gives back on success. An OpenAPI operation need not carry a
// `summary`, and this one's do not, so an index column fed from `summary`
// was empty on every row. The 2xx response description is the fact the spec
// does record, and it answers the same question.
function succeeds(c: any): string {
  for (const [status, response] of Object.entries<any>(c?.responses ?? {})) {
    if (/^2\d\d$/.test(status)) return String(response?.description || '').replace(/\.+$/, '')
  }
  return ''
}


type Route = {
  op: any, point: any, method: string, path: string,
  heading: string, id: string, c: any,
}

function routesOf(entity: any): Route[] {
  return rows(entity.op).flatMap((op: any) =>
    (op.points ?? []).filter((p: any) => p.active !== false).map((point: any) => {
      const method = String(point.method || '').toUpperCase()
      const path = String(point.orig || '')
      const heading = code(method) + ' ' + path
      return { op, point, method, path, heading, id: slugFor(heading), c: contract(point) }
    }))
}


// One entity page: the routes it exposes, its fields, then a reference
// section per route, each with its own anchor so the sidebar can link to it.
function entityReference(entity: any): { markdown: string, sections: Section[] } {
  const routes = routesOf(entity)
  const lines: string[] = []

  if (routes.length) {
    lines.push('## Operations', '',
      'Every route this entity exposes. Each route links to its own reference on this page.', '',
      '| Method | Route | SDK operation | Returns |', '| --- | --- | --- | --- |',
      ...routes.map(r => '| ' + code(r.method) + ' | [' + code(r.path) + '](#' + r.id + ') | ' +
        code(r.op.name) + ' | ' + cell(r.op.short || r.op.description || succeeds(r.c)) + ' |'), '')
  }

  lines.push('## Fields', '', fieldsTable(entity.fields ?? []), '')

  for (const op of rows(entity.op)) {
    lines.push('## ' + prose(op.name), '', prose(op.short || op.description || ''), '')
    for (const r of routes.filter(x => x.op.name === op.name)) {
      lines.push('### ' + r.heading, '')
      if (r.c.operationId) lines.push('Operation ID: ' + code(r.c.operationId) + '.', '')
      const auth = authText(r.c)
      if (auth) lines.push(auth, '')

      if (r.c.parameters?.length) {
        lines.push('#### Parameters', '',
          '| Parameter | In | Type | Required | Description |', '| --- | --- | --- | --- |',
          ...r.c.parameters.map((p: any) => '| ' + code(p.name) + ' | ' + code(p.in || '') + ' | ' +
            code(typeName(p.schema)) + ' | ' + (p.required ? 'Yes' : 'No') + ' | ' +
            cell(p.description || '') + ' |'), '')
      }

      if (r.c.requestBody) {
        lines.push('#### Request body', '', ...bodyText(r.c.requestBody.content, 'request body'))
      }

      const responses = r.c.responses
      if (responses && Object.keys(responses).length) {
        lines.push('#### Responses', '')
        for (const [status, response] of Object.entries<any>(responses)) {
          const described = String(response?.description || '').replace(/\.+$/, '')
          lines.push('##### ' + prose(status) + (described ? ': ' + prose(described) : ''), '')
          lines.push(...bodyText(response?.content, 'response'))
        }
      }
    }
  }

  return {
    markdown: lines.join('\n'),
    sections: routes.map(r => ({ id: r.id, title: r.method + ' ' + r.path })),
  }
}
export function pages(v: ReturnType<typeof view>, examples: Record<string,string> = {}): Page[] {
  const out: Page[] = []
  const add = (path: string, title: string, group: string, body: string) =>
    out.push({ path, title, group, markdown: '# ' + prose(title) + '\n\n' + body + '\n' })
  add('index', v.title, 'Overview', prose(v.description))
  const servers = v.info.servers ?? []
  const spec = specLink(v.model)
  add('api/index', 'API overview', 'API', [prose(v.info.summary || ''), '',
    ...servers.map((s: any) => '- ' + code(s.url) + (s.description ? ': ' + prose(s.description) : '')),
    ...(spec ? ['', 'This documentation is generated from the [OpenAPI specification](' + spec + ') held in the SDK repository.'] : []),
    '', ...v.entities.map(e => '- [' + prose(e.Name) + '](' + entityPage(e.name) + '.html)')].join('\n'))
  add('guides/authentication', 'Authentication', 'Guides',
    v.info.security && Object.keys(v.info.security).length ?
      'Configure credentials for the scheme described by the API model. Keep credentials outside source control.\n' +
      fence(JSON.stringify(v.info.security, null, 2)) : 'No authentication scheme is documented.')
  const first = v.entities.flatMap(e => rows(e.op).flatMap(op => (op.points || []).map((p: any) => ({ e, op, p })) ))[0]
  add('guides/first-call', 'Make your first API call', 'Guides', first ?
    '1. Choose an SDK from the SDK section and follow its installation instructions.\n' +
    '2. Configure the API server and authentication settings.\n' +
    '3. Open the [' + prose(first.e.Name) + ' reference](../api/' + entityPage(first.e.name) + '.html) and supply the parameters and request body it requires.\n' +
    '4. Call ' + code(first.op.name) + ' and inspect the returned entity data.\n\n' +
    'The first endpoint is ' + code(first.p.method + ' ' + first.p.orig) + '. Request and response examples come from the model.' :
    'Add an active entity and operation to the API model to document a first call.')
  add('guides/errors', 'Handle errors', 'Guides',
    'Check the status and error response documented for each operation. Handle authentication and validation failures before retrying a request.\n\n' +
    'Configure retry, timeout, and logging through the features present in the selected SDK. Review the feature reference for defaults and options.')
  add('guides/concepts', 'Entities, SDKs, and tools', 'Guides',
    'The API model defines entities, operations, fields, and endpoint contracts. SDK targets expose those operations in a programming language. Additional targets expose a command interface, an MCP server, or a data integration.\n\n' +
    'SDKs expose the API operations using each language’s conventions. Read the language reference for configuration and return values.')
  for (const entity of v.entities) {
    const reference = entityReference(entity)
    add('api/' + entityPage(entity.name), entity.Name, 'API',
      [prose(v.info.entity_desc?.[entity.name] || entity.desc || entity.short || ''), '',
        reference.markdown].join('\n'))
    out[out.length - 1].sections = reference.sections
  }
  for (const target of v.targets) {
    const kind = surface(target, v.kit), detail = v.kit.doc?.target?.[target.name] ?? {}
    const applicable = new Set(Object.keys(targetFeatures(v.model, target.name)))
    const features = v.features.filter(f => applicable.has(f.name))
    const text = [prose(detail.description || target.title || target.name), '', '## Install', '',
      prose(installation(v.model, target)), '', '## Package', '', code(packageName(v.model, target.name)), '',
      '## API reference', '', ...(kind === 'mcp' ? ['The API reference covers all entities. The tools section lists the operations this server exposes.', ''] : []), '| Entity | Operations |', '| --- | --- |', ...v.entities.map(e =>
        '| [' + cell(e.Name) + '](../api/' + entityPage(e.name) + '.html) | ' + rows(e.op).map(op => code(op.name)).join(', ') + ' |'),
      '', '## Configuration', '', 'Set the server URL and credentials for your environment. Enable only the features your application needs.',
      '', '## Features', '', ...features.map(f => '- [' + prose(f.title || f.name) + '](../features/' + encodeURIComponent(f.name) + '.html)')]
    if (examples[target.name]) text.push('', '## Set up the client', '', 'This setup fragment reads credentials from the environment. Use the API operation reference to supply input for each call.', '', fence(examples[target.name], detail.language || target.ext || target.name))
    if (kind === 'sdk') text.push('', '## Client defaults', '', fence(JSON.stringify(clientDefaults(v.model, target), null, 2)))
    if (kind === 'mcp') {
      text.push('', '## Tools', '')
      const tools = toolContracts(v.model, target, v.entities)
      if (tools.length) for (const tool of tools) {
        text.push('### ' + code(tool.name), '', prose(tool.description), fence(JSON.stringify(tool.input || {}, null, 2)))
        if (tool.supportedEntities) text.push(tool.supportedEntities.length ?
          'Supported entities: ' + tool.supportedEntities.map(code).join(', ') + '.' :
          'This tool is registered, but no active entity supports ' + code(tool.operation) + '.', '')
      }
      else text.push('No tool contracts are recorded in this target’s documentation model.')
    }
    add((kind === 'sdk' ? 'sdks/' : 'tools/') + encodeURIComponent(target.name), target.title || target.name,
      kind === 'sdk' ? 'SDKs' : 'Tools', text.join('\n'))
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
    const stages = rows(feature.hook)
    const options = feature.config?.options ?? {}
    // A FEATURE PAGE HAS TO EXPLAIN ITSELF.
    //
    // It used to be a one-line description, a bare JSON blob, and two headings:
    // a reader who did not already know what a feature was, whether it was on,
    // or what a "pipeline stage" meant got no help from the page. Each section
    // now says what it is and what to do with it, which costs three sentences
    // and makes the page readable on its own.
    add('features/' + encodeURIComponent(feature.name), feature.title || feature.name, 'Features',
      [prose(feature.description || feature.short || ''), '',
        'A feature adds behaviour around API calls without changing how you call the API.'
        + ' Being documented here does not mean it is switched on: features are off by'
        + ' default, and you enable the ones your application needs when you construct the'
        + ' client.', '',
        '## Options', '',
        ...(0 < Object.keys(options).length
          ? ['The settings this feature reads, with the defaults compiled into the SDK.'
             + ' Pass replacements in the client configuration to change them; set'
             + ' ' + code('active') + ' to turn the feature on.', '',
             fence(JSON.stringify(options, null, 2))]
          : ['This feature takes no configuration options.']),
        '', '## Pipeline stages', '',
        ...(0 < stages.length
          ? ['The points in the request lifecycle where this feature runs. The SDK calls'
             + ' each stage in order as it prepares a request, sends it, and handles the'
             + ' response.', '',
             ...stages.map(h => '- ' + code(h.name))]
          : ['No pipeline stages are enabled for this feature.'])].join('\n'))
  }
  return out
}
export function slides(v: ReturnType<typeof view>, example = ''): string {
  const chunks = [prose(v.title) + '\n\n' + prose(v.info.summary || v.description) + (v.kit.doc?.brand?.notice ? '\n\n' + prose(v.kit.doc.brand.notice) : ''),
    'API capabilities\n\n' + v.entities.map(e => '- ' + prose(e.Name) + ': ' + rows(e.op).map(o => code(o.name)).join(', ')).join('\n'),
    'Authentication\n\n' + (v.info.security?.type ? 'Use ' + code(v.info.security.type) + ' authentication. Configure credentials outside source control.' : 'The model declares no authentication scheme.'),
    'Make your first call\n\n1. Install an SDK.\n2. Configure the server and credentials.\n3. Supply the operation’s required input.\n4. Inspect the response.']
  for (let i = 0; i < v.targets.length; i += 5) chunks.push('SDKs and tools ' + (Math.floor(i / 5) + 1) + ' / ' + Math.ceil(v.targets.length / 5) + '\n\n' + v.targets.slice(i, i + 5)
    .map(t => '- ' + prose(t.title || t.name) + ': ' + (isPublished(v.model, t.name) ? prose(installation(v.model, t)) : 'build from ' + code(t.name + '/'))).join('\n'))
  if (example) chunks.splice(4, 0, 'Set up a client\n\n' + example)
  chunks.push('Next steps\n\n- Follow the first-call guide.\n- Read the API and SDK reference.\n- Review the feature and tool documentation.')
  return chunks.map(c => '# ' + c).join('\n\n---\n\n') + '\n'
}
