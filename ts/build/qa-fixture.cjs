const Fs = require('node:fs')
const Path = require('node:path')
const {generate, scaffoldDefaults} = require('../dist/docgen')
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

async function main() {
  const root=Path.resolve(__dirname,'../.docgen/fixture')
  const write=(file, text)=>{const p=Path.join(root,file);Fs.mkdirSync(Path.dirname(p),{recursive:true});Fs.writeFileSync(p,text)}
  for (const [file,text] of Object.entries(scaffoldDefaults())) write('.sdk/'+file,text)
  write('.sdk/package.json','{}')
  const m=model()
  m.main.kit.doc.edition.presentation={kind:'presentation',active:true,output:{path:'presentation'}}
  for (const [name,e] of Object.entries(m.main.kit.doc.edition)) {
    Fs.cpSync(Path.resolve(__dirname,'../project/.sdk/tm/edition',e.kind),Path.join(root,'.sdk/tm/edition',name),{recursive:true})
    write('.sdk/dist/cmp/edition/'+name+'/Main_'+name+'.js', 'exports.Main=require('+JSON.stringify(require.resolve('../dist/docgen'))+').renderEdition')
  }
  write('.sdk/model/sdk.json',JSON.stringify(m,null,2))
  await generate({folder:root,model:m})
  console.log(root)
}
main().catch(e=>{console.error(e);process.exitCode=1})
