import { test } from 'node:test'
import Assert from 'node:assert/strict'
import Fs from 'node:fs'
import Os from 'node:os'
import Path from 'node:path'
import { spawnSync } from 'node:child_process'
import { generate, scaffoldDefaults, checkText, proseText, prepareProject, styleFor } from '../dist/docgen'
const PACKAGE = Path.resolve(__dirname, '..')
function model() {
  return { name:'petstore', origin:'acme', main:{ kit:{
    info:{title:'Pet API',summary:'Store and retrieve pet records.',security:{type:'http',scheme:'bearer'},servers:[{url:'https://api.example.test'}]},
    target:{ts:{name:'ts',title:'TypeScript',active:true,ext:'ts',module:{name:'petstore'},publish:{registry:{active:false,state:'pending'}}},
      'go-mcp':{name:'go-mcp',title:'MCP server',active:true,module:{name:'petstore'}}},
    entity: { pet: { name: 'pet', active: true, fields: [{ name: 'id', type: 'number', req: true }],
      op: { load: { name: 'load', points: [{ method: 'GET', orig: '/pets/{id}', contract: {
        json: JSON.stringify({ parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Pet record', content: { 'application/json': { schema: { type: 'object' } } } } } })
      } }] } }
    } },
    feature:{retry:{name:'retry',title:'Retry',active:true,config:{options:{active:false}},hook:{PreFetch:{active:true}}}},
    doc:{edition:{summary:{kind:'summary',active:true,output:{path:'SUMMARY.md'}},'github-pages':{kind:'github-pages',active:true,output:{path:'docs'}}},
      target:{'go-mcp':{kind:'mcp',tool:{petstore_load:{description:'Load a pet.',input:{type:'object',properties:{id:{type:'integer'}}}}}}}}
  }}}
}
function fixture(m: any = model()) {
  const root=Fs.mkdtempSync(Path.join(Os.tmpdir(),'docgen-editions-'))
  const write=(p:string,s:string)=>{const dest=Path.join(root,p);Fs.mkdirSync(Path.dirname(dest),{recursive:true});Fs.writeFileSync(dest,s)}
  for (const [p,s] of Object.entries(scaffoldDefaults())) write('.sdk/'+p,s)
  write('.sdk/package.json','{}')
  for(const [name,e] of Object.entries<any>(m.main.kit.doc.edition)) {
    const from=Path.join(PACKAGE,'project/.sdk/tm/edition',e.kind)
    Fs.cpSync(from,Path.join(root,'.sdk/tm/edition',name),{recursive:true})
    write('.sdk/dist/cmp/edition/'+name+'/Main_'+name+'.js','exports.Main=require('+JSON.stringify(Path.join(PACKAGE,'dist/docgen.js'))+').renderEdition')
  }
  return {root,m,write,read:(p:string)=>Fs.readFileSync(Path.join(root,p),'utf8'),clean:()=>Fs.rmSync(root,{recursive:true,force:true})}
}
test('a feature page explains itself to a reader who knows none of this',async()=>{
  // The page used to be a one-line description, a bare JSON blob and two
  // headings. Nothing said what a feature was, whether it was on, or what a
  // "pipeline stage" meant.
  const m=model()
  const f=fixture(m)
  try {
    await generate({folder:f.root,model:m})
    const page=f.read('docs/features/retry.html')
    Assert.match(page,/adds behaviour around API calls/)
    Assert.match(page,/features are off by\s*\n?\s*default/)
    Assert.match(page,/defaults compiled into the SDK/)
    Assert.match(page,/points in the request lifecycle/)
    // The model content is still there — the prose is an addition, not a
    // replacement.
    Assert.match(page,/PreFetch/)
  } finally { f.clean() }
})
test('a feature page never renders a heading with nothing under it',async()=>{
  // univec's `proxy` is an ACTIVE feature whose 11 declared hooks are all
  // `active: false`. rows() drops inactive entries, correctly, but the headings
  // were emitted unconditionally — so the published page carried a "Pipeline
  // stages" section with no body:
  // https://voxgig-sdk.github.io/univec-sdk/features/proxy.html
  const m=model()
  ;(m.main.kit.feature as any).proxy={name:'proxy',title:'Outbound proxy',active:true,
    config:{options:{}},
    hook:{PreFetch:{active:false},PostFetch:{active:false}}}
  const f=fixture(m)
  try {
    await generate({folder:f.root,model:m})
    const page=f.read('docs/features/proxy.html')
    // Both sections still appear — a reader asking whether proxy hooks into the
    // pipeline should get an answer, not a missing section.
    Assert.match(page,/Pipeline stages/)
    Assert.match(page,/No pipeline stages are enabled for this feature/)
    Assert.match(page,/This feature takes no configuration options/)
    // And a feature that DOES have active stages still lists them.
    const test=f.read('docs/features/retry.html')
    Assert.match(test,/PreFetch/)
    Assert.ok(!/No pipeline stages are enabled/.test(test))
  } finally { f.clean() }
})
test('an entity named index does not collide with the API landing page',async()=>{
  // `api/index.html` is the API section's own overview, and a web server serves
  // it for the directory, so it cannot move. An entity named `index` used to
  // claim the same path and generation died with
  // "Duplicate documentation page: api/index" — which is how 4 of the 609
  // freepublicapis SDKs (4chan among them) could not be documented at all.
  const m=model()
  ;(m.main.kit.entity as any).index={name:'index',active:true,fields:[{name:'id',type:'string',req:true}],
    op:{list:{name:'list',points:[{method:'GET',orig:'/index'}]}}}
  const f=fixture(m)
  try {
    await generate({folder:f.root,model:m})
    // Both pages exist, and they are different pages.
    const overview=f.read('docs/api/index.html')
    const entity=f.read('docs/api/index-entity.html')
    // Both exist and are genuinely different pages. Not "the entity page lacks
    // the words API overview" — every page renders the nav, which links to it.
    Assert.match(overview,/API overview/)
    Assert.notEqual(overview,entity)
    Assert.match(entity,/<h1[^>]*>Index<\/h1>/)
    // And the overview LINKS to the moved page, not to itself — a page that
    // moves without its links is worse than the collision.
    Assert.match(overview,/index-entity\.html/)
  } finally { f.clean() }
})
test('default scaffold contains summary and Pages, without Slidev',()=>{
  const files=scaffoldDefaults();Assert.ok(files['model/edition/summary.aon']);Assert.ok(files['model/edition/github-pages.aon']);Assert.ok(!Object.keys(files).some(p=>p.includes('presentation')))
})
test('all editions render model content; site links resolve and output is deterministic',async()=>{
  const m=model();(m.main.kit.doc.edition as any).presentation={kind:'presentation',active:true,output:{path:'presentation'}}
  const f=fixture(m)
  try {
    f.write('.sdk/doc/content/start.md','# Start\n\nRead the [details](nested/details.md).\n')
    f.write('.sdk/doc/content/nested/details.md','# Details\n\nRead the [start](../start.md).\n')
    const first=await generate({folder:f.root,model:m})
    Assert.equal(first.editions.length,3)
    Assert.match(f.read('SUMMARY.md'),/TypeScript/)
    Assert.match(f.read('docs/api/pet.html'),/Parameters/)
    Assert.match(f.read('docs/api/pet.html'),/Responses/)
    Assert.match(f.read('docs/tools/go-mcp.html'),/petstore_load/)
    Assert.match(f.read('docs/features/retry.html'),/PreFetch/)
    Assert.match(f.read('presentation/slides.md'),/provider: none/)
    for(const p of first.files.filter(p=>p.endsWith('.html'))) {
      const html=f.read(p)
      for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        const url=match[1].split('#')[0]
        if(!url||/^[a-z]+:/i.test(url))continue
        Assert.ok(Fs.existsSync(Path.resolve(f.root,Path.dirname(p),url)),p+' broken link '+url)
      }
    }
    const before=f.read('docs/index.html');await generate({folder:f.root,model:m});Assert.equal(f.read('docs/index.html'),before)
    const qa=JSON.parse(f.read('.sdk/doc/qa-manifest.json'))
    Assert.ok(qa.files.includes('presentation/slides.md'));Assert.ok(qa.files.includes('SUMMARY.md'));Assert.ok(qa.files.includes('docs/additional/start.html'))
    Assert.match(f.read('.github/workflows/docgen.yml'),/needs: check/)
    Assert.match(f.read('.github/workflows/docgen.yml'),/voxgig-docgen generate \.\./)
    Assert.doesNotMatch(f.read('.github/workflows/docgen.yml'),/npm run generate|voxgig-model/)
  } finally {f.clean()}
})
test('filters, aliases, and per-edition styles are independent',async()=>{
  const m:any=model();m.main.kit.doc.style={color:{primary:'#123456'},font:'Arial'}
  m.main.kit.doc.edition.summary.filter={targets:['ts']}
  m.main.kit.doc.edition.portal={kind:'github-pages',active:true,output:{path:'portal'},style:{color:{primary:'#abcdef'}}}
  m.main.kit.doc.ci={active:false}
  const f=fixture(m)
  try {await generate({folder:f.root,model:m});Assert.doesNotMatch(f.read('SUMMARY.md'),/MCP server/);Assert.match(f.read('docs/assets/style.css'),/#123456/);Assert.match(f.read('portal/assets/style.css'),/#abcdef/);Assert.match(f.read('portal/assets/style.css'),/Arial/)}finally{f.clean()}
})
test('preflight refuses unsafe and overlapping output paths',async()=>{
  for(const path of ['../escape','.sdk','.git','.github','.sdk/model','ts','docs']) {
    const m:any=model();m.main.kit.doc.edition.summary.output.path=path;const f=fixture(m)
    try {await Assert.rejects(generate({folder:f.root,model:m}));Assert.ok(!Fs.existsSync(Path.join(f.root,'docs/index.html')))}finally{f.clean()}
  }
})
test('dry run writes nothing and stale owned pages are removed',async()=>{
  const f=fixture()
  try {
    await generate({folder:f.root,model:f.m,control:{dryrun:true}});Assert.ok(!Fs.existsSync(Path.join(f.root,'docs')))
    await generate({folder:f.root,model:f.m});f.write('docs/handwritten.txt','keep')
    f.m.main.kit.entity.pet.active=false;await generate({folder:f.root,model:f.m})
    Assert.ok(!Fs.existsSync(Path.join(f.root,'docs/api/pet.html')));Assert.equal(f.read('docs/handwritten.txt'),'keep')
  }finally{f.clean()}
})
test('the prose gate reads what docgen wrote, not what the definition said', () => {
  const { authored, proseText } = require('../dist/qa')
  const { prose } = require('../dist/content')

  // Vale used to read the whole rendered page, so it spell-checked the API
  // definition. On NoFrixion that was 9,819 errors: `Xero`, `payin`, `pisp`
  // and `jwk` are that API's vocabulary, and `remvoed`, `amound` and `wehn`
  // are typos in their spec. Neither is ours to fix.
  const page = '<p>Docgen wrote this.</p><table><tr><td>remvoed amound wehn</td></tr></table>'
  Assert.match(authored(page, 'html'), /Docgen wrote this/)
  Assert.doesNotMatch(authored(page, 'html'), /remvoed|amound|wehn/)
  Assert.match(proseText(page, 'html'), /remvoed/)

  const markdown = 'Docgen wrote this.\n\n| Field | Note |\n| --- | --- |\n| id | remvoed |\n'
  Assert.match(authored(markdown, 'md'), /Docgen wrote this/)
  Assert.doesNotMatch(authored(markdown, 'md'), /remvoed/)

  // Line-break markup and the YAML block's indentation, both of which reached
  // the page: NoFrixion's security scheme rendered as
  // "the Bearer scheme.&lt;br/&gt;" followed by twenty spaces.
  Assert.equal(
    prose('Bearer scheme.<br/>\r\n          Enter your token.'),
    'Bearer scheme. Enter your token.')

  // Escaping still happens after the unwrapping, so no markup survives.
  Assert.equal(prose('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;')
}, )

test('the voice rule reads docgen prose, not quoted specification text', () => {
  const { checkText } = require('../dist/qa')
  const voice = 'Use neutral or second-person prose'

  // Ours, and still caught.
  Assert.ok(checkText('<p>We built this for you.</p>', 'html').includes(voice))
  Assert.ok(checkText('We built this for you.', 'md').includes(voice))

  // Theirs. Every field description in the API reference is the upstream
  // author's sentence: NoFrixion's spec says "returned by the service provider
  // initiating the payment for us", and five pages failed a rule that exists to
  // keep docgen's own voice neutral.
  Assert.ok(!checkText('<table><tr><td>returned for us</td></tr></table>', 'html').includes(voice))
  Assert.ok(!checkText('| Field | Note |\n| --- | --- |\n| id | returned for us |', 'md').includes(voice))

  // Only that rule is narrowed. A defect is a defect wherever it appears.
  Assert.ok(checkText('<table><tr><td>Fast! Really fast!</td></tr></table>', 'html').length > 0)

  // A URL is not prose: `en-us` in a Microsoft docs link failed the voice rule.
  Assert.ok(!checkText('<p>See https://docs.microsoft.com/en-us/dotnet/standard</p>', 'html').includes(voice))
}, )

test('upstream spec prose is normalised before it reaches the gate', () => {
  const { prose } = require('../dist/content')

  // A LATIN ABBREVIATION WITHOUT ITS FINAL DOT. NoFrixion's spec says
  // "Its 1 based. i.e firstpage is 1", and `i.e` tokenises as a bare "I", so
  // nineteen generated pages failed the neutral-voice gate on the strength of
  // one upstream typo. The rewrite used to require the trailing dot.
  Assert.match(prose('Its 1 based. i.e firstpage is 1'), /that is firstpage/)
  Assert.match(prose('e.g a value'), /for example a value/)
  Assert.match(prose('i.e., the thing'), /that is, the thing/)

  // A DOUBLED WORD, from the same spec: "get the the FX held rates for".
  Assert.equal(prose('get the the FX held rates for'), 'get the FX held rates for')

  // But only where repetition is never correct. English has genuine doublings,
  // and tidying a typo must not rewrite meaning.
  Assert.equal(prose('he had had enough'), 'he had had enough')
  Assert.equal(prose('that that is fine'), 'that that is fine')
}, )

test('model prose cannot execute HTML or Vue expressions',async()=>{
  const m:any=model();m.main.kit.info.summary='<script>alert(1)</script> {{ execute() }}'
  m.main.kit.doc.edition.presentation={kind:'presentation',active:true,output:{path:'presentation'}}
  const f=fixture(m)
  try{await generate({folder:f.root,model:m});Assert.doesNotMatch(f.read('docs/index.html'),/<script>alert/);Assert.doesNotMatch(f.read('presentation/slides.md'),/\{\{ execute/)}finally{f.clean()}
})
test('text QA gates Markdown, rendered HTML, and Slidev prose but excludes code',()=>{
  Assert.ok(checkText('A seamless\nintegration.').length)
  Assert.ok(checkText('<main>A seamless integration.</main>','html').length)
  Assert.ok(checkText('---\ntheme: none\n---\n# A seamless integration').length)
  Assert.equal(checkText('Use `seamless` as an identifier.\n```ts\nconst seamless = true\n```').length,0)
  Assert.equal(checkText('<main>Use the identifier.<pre>seamless</pre></main>','html').length,0)
  Assert.ok(checkText('We make requests.').length)
  Assert.ok(checkText('One — two.').length)
  Assert.equal(proseText('<p>A &amp; B</p>','html'),'A & B')
})
test('model schema compiles with all three editions and shared style overrides',()=>{
  const {Aontu}=require('aontu')
  const source=Fs.readFileSync(Path.join(PACKAGE,'model/docgen.aon'),'utf8')+'\nmain: kit: doc: style: color: primary: "#123456"\nmain: kit: doc: edition: summary: {kind: "summary", active:true, output:path:"SUMMARY.md"}'
  const all=source+'\nmain: kit: doc: edition: {presentation: {kind: \"presentation\", output:path:\"presentation\"}, \"github-pages\": {kind:\"github-pages\", output:path:\"docs\"}}'
  const out=new Aontu().generate(all,{path:Path.join(PACKAGE,'model/docgen.aon')})
  Assert.equal(out.main.kit.doc.edition.summary.output.path,'SUMMARY.md');Assert.equal(out.main.kit.doc.style.color.primary,'#123456')
  Assert.equal(Object.keys(out.main.kit.doc.edition).length,3)
  Assert.throws(()=>new Aontu().generate(all+'\nmain: kit: doc: edition: invalid: {kind: \"summary\", active: \"wrong type\", output:path:\"invalid.md\"}',{path:Path.join(PACKAGE,'model/docgen.aon')}))
})
test('package manifest and shipped edition trees agree',()=>{
  const manifest=require('../project/sdkgen-package.json')
  Assert.deepEqual(manifest.provides.edition,['summary','github-pages','presentation'])
  for(const name of manifest.provides.edition)Assert.ok(Fs.existsSync(Path.join(PACKAGE,'project/.sdk/src/cmp/edition',name,'Main_'+name+'.ts')))
  const packed=spawnSync('npm',['pack','--dry-run','--json','--ignore-scripts'],{cwd:PACKAGE,shell:process.platform==='win32',encoding:'utf8',env:{...process.env,npm_config_cache:Path.join(Os.tmpdir(),'docgen-npm-cache')}})
  Assert.equal(packed.status,0,packed.stderr)
  const json=JSON.parse(packed.stdout),entry=Array.isArray(json)?json[0]:Object.values<any>(json)[0]
  const paths=entry.files.map((f:any)=>f.path)
  Assert.ok(!paths.some((path:string)=>path.startsWith('.sdk/') || path === 'sdkgen-package.json'))
  Assert.equal(manifest.version,require('../package.json').version)
  for(const path of ['qa/vale.ini','qa/styles/config/vocabularies/Docgen/reject.txt','model/docgen.aon','bin/voxgig-docgen','README.md','LICENSE','project/sdkgen-package.json','project/.sdk/tm/edition/github-pages/page.html','assets/nunito.woff2','assets/nunito.woff2.license.txt','admin/setup-github-pages.sh','dist/admin/github-pages.js'])Assert.ok(paths.includes(path),path)
})

test('project bootstrap installs defaults once and preserves customised templates', () => {
  const root = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'docgen-bootstrap-'))
  try {
    Fs.mkdirSync(Path.join(root,'.sdk/model'),{recursive:true})
    Fs.writeFileSync(Path.join(root,'.sdk/model/sdk.aon'),'main: kit: {}\n')
    prepareProject(root)
    const file = Path.join(root,'.sdk/tm/edition/github-pages/page.html')
    Assert.ok(Fs.existsSync(file))
    Assert.ok(!Fs.existsSync(Path.join(root,'.sdk/model/edition/presentation.aon')))
    Fs.writeFileSync(file,'custom page')
    prepareProject(root)
    Assert.equal(Fs.readFileSync(file,'utf8'),'custom page')
    Assert.equal(Fs.readFileSync(Path.join(root,'.sdk/model/sdk.aon'),'utf8').split('edition-index.aon').length,2)

    // A LATER DOCGEN THAT ADDS A TEMPLATE FILE STILL REACHES THIS PROJECT.
    // Deleting one stands in for a file the package has and the project has
    // not: the next prepareProject restores it, WITHOUT reverting the
    // customised template beside it, and without introducing an edition the
    // project never asked for.
    const added = Path.join(root,'.sdk/tm/edition/github-pages/search.js')
    Assert.ok(Fs.existsSync(added))
    Fs.rmSync(added)
    prepareProject(root)
    Assert.ok(Fs.existsSync(added))
    Assert.equal(Fs.readFileSync(file,'utf8'),'custom page')
    Assert.ok(!Fs.existsSync(Path.join(root,'.sdk/tm/edition/presentation')))
  } finally { Fs.rmSync(root,{recursive:true,force:true}) }
})
test('local branding assets retain their bytes in the website and presentation', async () => {
  const m:any = model()
  m.main.kit.doc.style={logo:'logo.png',fontFile:'brand.woff2'}
  m.main.kit.doc.edition.presentation={kind:'presentation',active:true,output:{path:'presentation'}}
  const f=fixture(m), bytes=Buffer.from([0,1,127,128,255])
  try {
    Fs.mkdirSync(Path.join(f.root,'.sdk/doc/assets'),{recursive:true})
    for(const file of ['logo.png','brand.woff2'])Fs.writeFileSync(Path.join(f.root,'.sdk/doc/assets',file),bytes)
    await generate({folder:f.root,model:m})
    Assert.deepEqual(Fs.readFileSync(Path.join(f.root,'docs/assets/logo.png')),bytes)
    Assert.deepEqual(Fs.readFileSync(Path.join(f.root,'presentation/assets/font.woff2')),bytes)
    Assert.match(f.read('presentation/global-top.vue'),/logo.png/)
    Assert.match(f.read('docs/assets/style.css'),/DocgenLocal/)
  } finally {f.clean()}
})

test('SDK defaults and MCP capability limits reflect the model', async () => {
  const m:any=model();delete m.main.kit.doc.target['go-mcp'].tool
  const f=fixture(m)
  try {
    await generate({folder:f.root,model:m})
    Assert.match(f.read('docs/sdks/ts.html'),/https:\/\/api.example.test/)
    Assert.match(f.read('docs/sdks/ts.html'),/Bearer/)
    const mcp=f.read('docs/tools/go-mcp.html')
    Assert.match(mcp,/no active entity supports <code>list<\/code>/)
    Assert.match(mcp,/Supported entities: <code>pet<\/code>/)
    Assert.doesNotMatch(mcp,/&quot;enum&quot;: \[\]/)
    Assert.match(mcp,/<details open><summary>Tools<\/summary>/)
    Assert.equal(checkText(f.read('docs/index.html'),'html').length,0)
  } finally { f.clean() }
})

test('Pages staging excludes project-owned notes and stale output', async () => {
  const {stageSite}=require('../dist/docgen')
  const f=fixture();let artifact=''
  try {
    await generate({folder:f.root,model:f.m})
    f.write('.sdk/model/sdk.json',JSON.stringify(f.m))
    f.write('docs/reviews/private-note.md','Internal review')
    f.write('docs/old.html','Retired page')
    artifact=stageSite(f.root,'github-pages')
    Assert.ok(Fs.existsSync(Path.join(artifact,'index.html')))
    Assert.ok(Fs.existsSync(Path.join(artifact,'.nojekyll')))
    Assert.ok(!Fs.existsSync(Path.join(artifact,'reviews')))
    Assert.ok(!Fs.existsSync(Path.join(artifact,'old.html')))
    Assert.match(f.read('.github/workflows/docgen.yml'),/steps.site.outputs.path/)
    Fs.unlinkSync(Path.join(f.root,'docs/api/pet.html'))
    Assert.throws(()=>stageSite(f.root,'github-pages'))
  } finally { f.clean();if(artifact)Fs.rmSync(artifact,{recursive:true,force:true}) }
})

test('summary orients readers and links from a nested output location', async () => {
  const m:any=model()
  m.main.kit.info.description='Store pet records and retrieve the current catalogue.'
  m.main.kit.entity.pet.op.list={name:'list',points:[{method:'GET',orig:'/pets',contract:{json:JSON.stringify({security:[],responses:{200:{description:'Pet records'}}})}}]}
  m.main.kit.doc.edition.summary.output.path='overview/SUMMARY.md'
  const f=fixture(m)
  try {
    await generate({folder:f.root,model:m})
    const text=f.read('overview/SUMMARY.md')
    Assert.match(text,/Store pet records and retrieve the current catalogue/)
    Assert.match(text,/curl --fail-with-body --silent --show-error 'https:\/\/api.example.test\/pets'/)
    Assert.match(text,/\.\.\/docs\/api\/pet.html/)
    Assert.match(text,/Choose an SDK/)
    Assert.match(text,/Operational features/)
    Assert.doesNotMatch(text,/curl[^\n]*\{id\}/)
  } finally {f.clean()}
})

test('summary does not invent anonymous examples or reference an inactive site', async () => {
  const m:any=model();m.main.kit.doc.edition['github-pages'].active=false
  const f=fixture(m)
  try {
    await generate({folder:f.root,model:m})
    Assert.doesNotMatch(f.read('SUMMARY.md'),/curl --|\]\(docs\//)
  } finally {f.clean()}
})

// The API section is an API REFERENCE, grouped by entity rather than by
// OpenAPI tag: an entity is what the SDKs expose, so `pet.load(...)` is what
// the reader actually calls. Every route of an entity lives on that entity's
// page, and the page has to be navigable the way a reference is.
//
// What this pins is the structure, not the prose: an operations index whose
// links resolve, a route heading that carries its method, a response heading
// that carries its status, schemas as property tables rather than the JSON
// Schema dumps this replaced, and a sidebar that reaches individual routes.
test('the API reference is structured by entity, route and status',async()=>{
  const m:any=model()
  m.main.kit.entity.pet.op.load.points[0].contract.json=JSON.stringify({
    operationId:'loadPet',
    parameters:[{name:'id',in:'path',required:true,schema:{type:'integer'},description:'Pet identifier.'}],
    security:[{bearerAuth:[]}],
    securitySchemes:{bearerAuth:{type:'http',scheme:'bearer'}},
    requestBody:{content:{'application/json':{schema:{type:'object',required:['tag'],
      properties:{tag:{type:'string',description:'Short label.'}}}}}},
    responses:{'200':{description:'Pet record',content:{'application/json':{schema:{
      type:'object',required:['data'],properties:{
        data:{type:'object',required:['name'],properties:{
          name:{type:'string',description:'Display name.'},
          tags:{type:'array',items:{type:'string'}}}},
        ok:{type:'boolean'}}}}}},
      '404':{description:'No such pet'}}})
  const f=fixture(m)
  try {
    await generate({folder:f.root,model:m})
    const page=f.read('docs/api/pet.html')

    // An index of every route, each link resolving to a heading on the page.
    Assert.match(page,/Operations/)
    Assert.match(page,/href="#get-petsid"/)
    Assert.match(page,/<h3 id="get-petsid" class="operation" data-method="get">/)
    // The index reports what the route returns, from the 2xx description.
    Assert.match(page,/Pet record/)

    // Responses are classed by status family so each is recognisable.
    Assert.match(page,/<h5 id="200-pet-record" class="status" data-status="2xx">/)
    Assert.match(page,/data-status="4xx"/)

    // Authentication in words, not the raw `security` array.
    Assert.match(page,/Authentication: bearer token/)
    Assert.match(page,/loadPet/)

    // Parameters, with where each one goes.
    Assert.match(page,/Parameters/)
    Assert.match(page,/Pet identifier/)

    // Schemas render as property tables: nested objects flatten to dotted
    // paths, arrays name their element type, and `required` is a column.
    Assert.match(page,/data\.name/)
    Assert.match(page,/array of string/)
    Assert.match(page,/Display name/)
    // ... and the JSON Schema dump they replace is gone.
    Assert.doesNotMatch(page,/&quot;properties&quot;/)

    // The sidebar reaches individual routes, but only for the page being
    // read: every entity page would otherwise list every other page's.
    Assert.match(page,/class="nav-section" href="#get-petsid"/)
    Assert.doesNotMatch(f.read('docs/index.html'),/class="nav-section"/)

    // Operation ids appear in generated prose (specs cross-reference them),
    // so the generated spelling vocabulary has to carry them.
    Assert.match(f.read('.sdk/doc/qa/styles/config/vocabularies/Docgen/accept.txt'),/\[Ll\]\[Oo\]\[Aa\]\[Dd\]\[Pp\]\[Ee\]\[Tt\]/)
  } finally {f.clean()}
})

test('the website links back to the SDK repository, declared or derived',async()=>{
  // Derived: no `repo` declared, so `<origin>/<name>-sdk` under github.com —
  // the same rule sdkgen uses for go.mod and the package manifests.
  const m:any=model()
  m.def='petstore.json'
  const f=fixture(m)
  try {
    await generate({folder:f.root,model:m})
    Assert.match(f.read('docs/index.html'),/class="repo-link" href="https:\/\/github.com\/acme\/petstore-sdk">acme\/petstore-sdk<\/a>/)
    // Every page carries it, not just the index — a reader deep in the
    // reference must be able to get back to the source.
    Assert.match(f.read('docs/api/index.html'),/class="repo-link" href="https:\/\/github.com\/acme\/petstore-sdk"/)
    // The API overview links the OpenAPI definition it was generated from,
    // at the path apidef resolves `def` against.
    Assert.match(f.read('docs/api/index.html'),/href="https:\/\/github.com\/acme\/petstore-sdk\/blob\/main\/.sdk\/def\/petstore.json">OpenAPI specification<\/a>/)
  } finally {f.clean()}

  // Declared: a repo that is not `<origin>/<name>-sdk` says so, and the link
  // follows. This is the case the derivation gets wrong on its own.
  const m2:any=model()
  m2.main.kit.repo={path:'acme/legacy-client-sdk',host:'gitlab.example'}
  const f2=fixture(m2)
  try {
    await generate({folder:f2.root,model:m2})
    Assert.match(f2.read('docs/index.html'),/class="repo-link" href="https:\/\/gitlab.example\/acme\/legacy-client-sdk">acme\/legacy-client-sdk<\/a>/)
    Assert.doesNotMatch(f2.read('docs/index.html'),/petstore-sdk/)
  } finally {f2.clean()}

  // No definition in the model -> no spec link at all. Linking
  // `.sdk/def/undefined` would be a guaranteed 404 on every generated site.
  const m3:any=model(); delete m3.def
  const f3=fixture(m3)
  try {
    await generate({folder:f3.root,model:m3})
    Assert.doesNotMatch(f3.read('docs/api/index.html'),/OpenAPI specification|\.sdk\/def\//)
  } finally {f3.clean()}
})

test('branding, local typography, and a logo-free slide frame survive generation',async()=>{
  const m:any=model()
  m.main.kit.doc.brand={url:'https://example.test',label:'example.test',notice:'Unofficial SDK. Generated by [Voxgig](https://voxgig.com/). No affiliation with the API provider.',shortNotice:'Unofficial SDK. {{ literal }}'}
  m.main.kit.doc.style={mode:'dark',color:{primary:'#49d49e',darkBackground:'#0e1615',darkText:'#f3f0ec'},fontFile:'body.woff2',headingFontFile:'heading.woff2',monoFile:'mono.woff2'}
  m.main.kit.doc.edition.presentation={kind:'presentation',active:true,output:{path:'presentation'}}
  const f=fixture(m)
  try {
    for(const name of ['body','heading','mono']) {f.write('.sdk/doc/assets/'+name+'.woff2','font fixture');f.write('.sdk/doc/assets/'+name+'.woff2.license.txt','Font license')}
    await generate({folder:f.root,model:m})
    Assert.match(f.read('docs/index.html'),/class="provider-link" href="https:\/\/example.test"/)
    Assert.match(f.read('docs/index.html'),/Unofficial SDK/)
    Assert.match(f.read('docs/index.html'),/Generated by <a href="https:\/\/voxgig.com\/">Voxgig<\/a>/)
    Assert.match(f.read('SUMMARY.md'),/Unofficial SDK/)
    Assert.match(f.read('presentation/slides.md'),/colorSchema: dark/)
    Assert.match(f.read('presentation/global-top.vue'),/docgen-frame/)
    Assert.match(f.read('presentation/global-top.vue'),/\$page/)
    Assert.match(f.read('presentation/global-top.vue'),/v-pre>Unofficial SDK. \{\{ literal \}\}/)
    Assert.doesNotMatch(f.read('presentation/global-top.vue'),/<img/)
    Assert.match(f.read('presentation/assets/style.css'),/DocgenHeading/)
    Assert.equal(f.read('docs/assets/heading-font.woff2.license.txt'),'Font license')
    Assert.equal(f.read('presentation/public/assets/heading-font.woff2.license.txt'),'Font license')
    Assert.ok(JSON.parse(f.read('.sdk/doc/qa-manifest.json')).files.includes('presentation/global-top.vue'))
    Assert.ok(checkText('<template><footer>This is seamless.</footer></template>','vue').length)
    m.main.kit.doc.brand.url='javascript:alert(1)'
    await Assert.rejects(generate({folder:f.root,model:m}),/must use HTTP/)
  }finally{f.clean()}
})


test('Voxgig defaults and project themes are independent in all visual editions',async()=>{
  const m:any=model()
  m.main.kit.doc.edition.presentation={kind:'presentation',active:true,output:{path:'presentation'}}
  const f=fixture(m)
  try {
    const defaults=styleFor(m,{})
    Assert.equal(defaults.mode,'light')
    Assert.equal(defaults.color.primary,'#e70042')
    const {Aontu}=require('aontu')
    const schema=new Aontu().generate(Fs.readFileSync(Path.join(PACKAGE,'model/docgen.aon'),'utf8'))
    Assert.deepEqual(schema.main.kit.doc.style.color,defaults.color)
    Assert.equal(schema.main.kit.doc.style.font,defaults.font)
    Assert.equal(schema.main.kit.doc.style.mode,defaults.mode)
    await generate({folder:f.root,model:m})
    for(const prefix of ['docs','presentation']) {
      Assert.match(f.read(prefix+'/assets/style.css'),/--primary:#e70042;--accent:#00c6d8;--background:#f5f5f9;--text:#0a0a0a/)
      Assert.match(f.read(prefix+'/assets/style.css'),/font-family:Nunito/)
      Assert.ok(Fs.existsSync(Path.join(f.root,prefix,'assets/nunito.woff2')))
    }
    Assert.ok(Fs.existsSync(Path.join(f.root,'presentation/public/assets/nunito.woff2.license.txt')))
    Assert.doesNotMatch(f.read('docs/index.html'),/univec.ai/)
    m.main.kit.doc.style={mode:'dark',font:'Arial',headingFont:'Arial',color:{primary:'#49d4a1',accent:'#f7bc45',darkBackground:'#0e1615',darkText:'#f3f1ec'}}
    await generate({folder:f.root,model:m})
    for(const prefix of ['docs','presentation']) {
      Assert.match(f.read(prefix+'/assets/style.css'),/--primary:#49d4a1/)
      Assert.match(f.read(prefix+'/assets/style.css'),/--background:#0e1615;--text:#f3f1ec/)
      Assert.doesNotMatch(f.read(prefix+'/assets/style.css'),/Nunito|#e70042/)
      Assert.ok(!Fs.existsSync(Path.join(f.root,prefix,'assets/nunito.woff2')))
    }
    Assert.equal(styleFor(model(),{}).color.primary,'#e70042')
    Assert.equal(styleFor(m,{style:{color:{primary:'#123456'}}}).color.primary,'#123456')
  }finally{f.clean()}
})


test('Pages admin script is generated with executable permissions and removed when Pages is disabled',async()=>{
  const m:any=model(), f=fixture(m)
  try {
    await generate({folder:f.root,model:m,control:{dryrun:true}})
    Assert.ok(!Fs.existsSync(Path.join(f.root,'.sdk/admin/setup-github-pages.sh')))
    await generate({folder:f.root,model:m})
    const file=Path.join(f.root,'.sdk/admin/setup-github-pages.sh')
    Assert.match(f.read('.sdk/admin/setup-github-pages.sh'),/docgen\/dist\/admin\/github-pages.js/)
    if(process.platform!=='win32')Assert.ok(Fs.statSync(file).mode&0o111)
    f.write('.sdk/admin/status.sh','# status belongs to the scaffold\n')
    f.write('.sdk/admin/custom.sh','# project script\n')
    m.main.kit.doc.edition['github-pages'].active=false
    await generate({folder:f.root,model:m})
    Assert.ok(!Fs.existsSync(file))
    Assert.ok(Fs.existsSync(Path.join(f.root,'.sdk/admin/status.sh')))
    Assert.ok(Fs.existsSync(Path.join(f.root,'.sdk/admin/custom.sh')))
  }finally{f.clean()}
})


test('the deck teaches capabilities, then a tutorial, then extending with sdkgen', async () => {
  const m: any = model()
  m.main.kit.doc.edition.deck = { kind: 'presentation', output: { path: 'docs/slidev' } }
  const f = fixture(m)
  try {
    await generate({ folder: f.root, model: m })
    const deck = f.read('docs/slidev/slides.md')
    const at = (heading: string) => deck.indexOf('# ' + heading)

    // THE THREE ACTS, IN ORDER. The deck used to be a flat list that named no
    // operation and showed no code, so a reader reached the end with nothing
    // they could type.
    Assert.ok(-1 < at('API capabilities'))
    Assert.ok(at('API capabilities') < at('Tutorial: your first call'))
    Assert.ok(at('Tutorial: your first call') < at('This SDK is generated'))

    // The capabilities section is CAPPED. A 49-entity API produced nine
    // consecutive slides of list before the reader reached anything actionable.
    const capabilitySlides = (deck.match(/# API capabilities/g) || []).length
    Assert.ok(4 > capabilitySlides, 'capabilities capped at three slides, got ' + capabilitySlides)

    // With MANY entities, the cap holds and the remainder line fits INSIDE it.
    // Appending "and N more" to a full three slices spilled one bullet onto a
    // fourth slide, which is how NoFrixion's 49 entities produced four.
    const many: any = model()
    many.main.kit.doc.edition.deck = { kind: 'presentation', output: { path: 'docs/slidev' } }
    const pet = many.main.kit.entity.pet
    for (let i = 0; 40 > i; i++) {
      const clone = JSON.parse(JSON.stringify(pet))
      clone.name = 'pet' + i
      delete clone.Name
      many.main.kit.entity['pet' + i] = clone
    }
    const big = fixture(many)
    try {
      await generate({ folder: big.root, model: many })
      const bigDeck = big.read('docs/slidev/slides.md')
      Assert.equal((bigDeck.match(/# API capabilities/g) || []).length, 3)
      Assert.match(bigDeck, /and \d+ more, in the API reference/)
    } finally { big.clean() }

    // Act one states what comes with the SDK, features included. They were
    // absent from the deck entirely, though they are half of what it offers.
    Assert.match(deck, /Built-in features/)
    Assert.match(deck, /Authentication/)

    // Act two walks ONE REAL OPERATION from the model, not four generic
    // instructions. The dotted form is sdkgen's own: entity accessor, then
    // operation.
    Assert.match(deck, /Step 1: install/)
    Assert.match(deck, /Step 3: call an operation/)
    Assert.match(deck, /await client\.Pet\(\)\.load\(/)
    Assert.match(deck, /Step 4: handle the failure/)
    Assert.match(deck, /catch/)

    // Act three is about the generator, and names the one rule that decides
    // whether a customisation survives.
    Assert.match(deck, /voxgig-sdkgen target add/)
    Assert.match(deck, /voxgig-sdkgen feature add/)
    Assert.match(deck, /project\.aon/)

  } finally { f.clean() }
})

test('nested Slidev presentation stages built assets without its source or dependencies', async () => {
  const { stageSite, runQA } = require('../dist/docgen')
  const m: any = model()
  m.main.kit.doc.edition.deck = { kind: 'presentation', output: { path: 'docs/slidev' } }
  const f = fixture(m)
  let artifact = ''
  try {
    await generate({ folder: f.root, model: m })
    f.write('.sdk/model/sdk.json', JSON.stringify(m))
    Assert.match(f.read('docs/index.html'), /href="slidev\/index.html"/)
    Assert.match(f.read('docs/api/pet.html'), /href="..\/slidev\/index.html"/)
    Assert.ok(Fs.existsSync(Path.join(f.root, 'docs/slidev/uno.config.ts')))
    Assert.throws(() => stageSite(f.root, 'github-pages'), /Build presentation deck/)
    Assert.ok(runQA('.sdk/doc/qa-manifest.json', f.root, false).errors.some((error: string) => error.includes('broken local link')))
    f.write('docs/slidev/dist/index.html', '<h1>Built slides</h1>')
    f.write('docs/slidev/dist/assets/deck.js', 'console.log("deck")')
    Assert.deepEqual(runQA('.sdk/doc/qa-manifest.json', f.root, false).errors, [])
    f.write('docs/slidev/node_modules/private.txt', 'dependency')
    f.write('docs/reviews/notes.md', 'review notes')
    artifact = stageSite(f.root, 'github-pages')
    Assert.equal(Fs.readFileSync(Path.join(artifact, 'slidev/index.html'), 'utf8'), '<h1>Built slides</h1>')
    Assert.ok(Fs.existsSync(Path.join(artifact, 'slidev/assets/deck.js')))
    for (const name of ['slides.md', 'package.json', 'uno.config.ts', 'node_modules', 'dist']) {
      Assert.ok(!Fs.existsSync(Path.join(artifact, 'slidev', name)), name + ' leaked into Pages')
    }
    Assert.ok(!Fs.existsSync(Path.join(artifact, 'reviews')))
    Fs.rmSync(artifact, { recursive: true }); artifact = ''
    m.main.kit.doc.edition.deck.site = { active: false }
    await generate({ folder: f.root, model: m })
    f.write('.sdk/model/sdk.json', JSON.stringify(m))
    Assert.doesNotMatch(f.read('docs/index.html'), /class="presentation-link"/)
    artifact = stageSite(f.root, 'github-pages')
    Assert.ok(!Fs.existsSync(Path.join(artifact, 'slidev')))
  } finally { f.clean(); if (artifact) Fs.rmSync(artifact, { recursive: true, force: true }) }
})

test('nested edition paths still reject file and directory collisions', async () => {
  const m: any = model()
  m.main.kit.doc.edition.presentation = { kind: 'presentation', output: { path: 'docs/api/index.html' } }
  const f = fixture(m)
  try {
    await Assert.rejects(generate({ folder: f.root, model: m }), /overlaps presentation|Duplicate edition output/)
    Assert.ok(!Fs.existsSync(Path.join(f.root, 'docs/index.html')))
  } finally { f.clean() }
})
