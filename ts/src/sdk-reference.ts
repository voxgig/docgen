import { names } from 'jostraca'
import { configDefinition, goModule, packageName } from '@voxgig/sdkgen'

// Documentation adapters describe each installed surface without importing its
// README components. A project can replace examples through main.kit.doc.target.
export function exampleValues(model: any, target: any): Record<string, string> {
  const n: any = {}; names(n, model.name)
  return { Name:n.Name, name:model.name, lower:String(n.Name).toLowerCase(),
    env:String(model.name).replace(/[^a-z0-9]+/gi,'_').toUpperCase() + '_APIKEY',
    package:packageName(model,target.name), goModule:goModule(model,target.name),
    pyModule:model.name.replace(/-/g,'_') + '_sdk' }
}
export function setupExample(model: any, target: any, templates: Record<string,string>): string {
  const detail = model.main.kit.doc?.target?.[target.name]
  if (detail?.example) return detail.example
  const source = templates[target.origname || target.name]
  if (!source) return ''
  const values = exampleValues(model,target)
  return source.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error('Unknown SDK example template slot: ' + key)
    return values[key]
  })
}
export function toolContracts(model: any, target: any, entities: any[]): any[] {
  const defined = model.main.kit.doc?.target?.[target.name]?.tool
  if (defined && Object.keys(defined).length) return Object.keys(defined).sort().map(name=>({name,...defined[name]}))
  if ((target.origname || target.name) !== 'go-mcp') return []
  return ['list','load'].map(op => ({ name: model.name.toLowerCase() + '_' + op,
    description: op === 'list' ? 'List records for an entity.' : 'Load one record for an entity.',
    operation: op,
    supportedEntities: entities.filter(e=>e.op?.[op] && e.op[op].active !== false).map(e=>e.name),
    input: {type:'object',required:['entity'],properties:{
      entity:{type:'string',description:entities.map(e=>e.name).join(' | ')},
      query:{type:'object',description:'Optional match fields for the selected entity.'}}} }))
}

export function clientDefaults(model: any, target: any): any {
  const identity: any = {}; names(identity, model.name)
  const kit = model.main.kit
  const normalised = { ...model, const: identity,
    main: { ...model.main, kit: { ...kit, config: { headers: {}, ...kit.config } } } }
  return configDefinition(normalised, target.name).def.options
}
