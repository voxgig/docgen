import { OP_SUFFIX, entityIdField, entityOps, exampleVarName, idLiteral, matchArg, opRequestShape, primaryOpCall } from '@voxgig/sdkgen'
import type { ExampleLang } from '@voxgig/sdkgen'

type Call = { expr: string, resultVar: string, isVoid: boolean }

// How each language binds a call's result. The call itself is sdkgen's
// primaryOpCall, the phrasing the generated README uses, so the reference
// and the README cannot drift. See docs/design/entity-examples.md
const BINDING: Record<ExampleLang, (call: Call) => string> = {
  ts: c => (c.isVoid ? 'await ' : 'const ' + c.resultVar + ' = await ') + c.expr,
  js: c => (c.isVoid ? 'await ' : 'const ' + c.resultVar + ' = await ') + c.expr,
  py: c => (c.isVoid ? '' : c.resultVar + ' = ') + c.expr,
  rb: c => (c.isVoid ? '' : c.resultVar + ' = ') + c.expr,
  php: c => (c.isVoid ? '' : '$' + c.resultVar + ' = ') + c.expr + ';',
  lua: c => 'local ' + c.resultVar + ', err = ' + c.expr,
  // Go rejects an unused variable, so every result is printed.
  go: c => c.resultVar + ', err := ' + c.expr + '\nif err != nil {\n    panic(err)\n}\nfmt.Println(' + c.resultVar + ')',
}

export const EXAMPLE_LANGUAGES = Object.keys(BINDING) as ExampleLang[]

export function exampleLanguage(target: any): ExampleLang | undefined {
  const lang = target?.origname || target?.name
  return Object.hasOwn(BINDING, lang) ? lang : undefined
}

const RESULT_NAME: Record<string, string> = { create: 'created', update: 'updated', remove: 'removed' }

function resultName(op: string, entityVar: string): string {
  if ('list' === op) return entityVar + 's'
  if ('load' === op) return entityVar
  return RESULT_NAME[op]
}

// apidef emits `patch` as its own op, which no SDK has a method for:
// sdkgen's `OP_SUFFIX` keys the ops its Entity components generate.
function methodOps(entity: any): string[] {
  return entityOps(entity).filter(op => Object.hasOwn(OP_SUFFIX, op))
}

function paramsView(op: string, items: any[]): any {
  return { op: { [op]: { points: [{ g: { params: items.map(it => ({ n: it.name, t: it.type, r: true })) } }] } } }
}

// dataArg keeps only the required items, which on an apidef model is the id
// alone; the items chosen here go back to sdkgen as params, for its literals.
function updateArg(lang: ExampleLang, entity: any, idF: string | null, idLit: string): string {
  const items = opRequestShape(entity, 'update').items
  const own = items.filter(it => it.name !== idF && it.name !== 'id')
  const required = own.filter(it => !it.optional)
  const fields = required.concat(own.filter(it => it.optional)).slice(0, Math.max(2, required.length))
  const id = null == idF ? [] : [items.find(it => it.name === idF) ?? { name: idF, type: null }]
  return matchArg(lang, paramsView('update', id.concat(fields)), 'update', idF, idLit)
}

function withArg(lang: ExampleLang, expr: string, arg: string): string {
  return expr.replace(/\([^()]*\)$/, '(' + arg + ('go' === lang ? ', nil' : '') + ')')
}

const SDKGEN_FLOOR = '>=4.23.0'

const HELPER: Record<string, unknown> = {
  OP_SUFFIX, entityIdField, entityOps, exampleVarName, idLiteral, matchArg, opRequestShape, primaryOpCall,
}

function requireHelpers(): void {
  const missing = Object.keys(HELPER).filter(name => null == HELPER[name])
  if (0 < missing.length) throw new Error(
    'entity examples need @voxgig/sdkgen ' + SDKGEN_FLOOR + ', which exports ' + missing.join(', '))
}

export function entityExample(entity: any, lang: ExampleLang): string {
  requireHelpers()
  const idF = entityIdField(entity), entityVar = exampleVarName(entity.name, lang)
  return methodOps(entity).map(op => {
    const call: Call = primaryOpCall(lang, entity.Name, entityVar, op, idF, entity)
    const idLit = idLiteral(entity, op, idF)
    const arg = 'list' === op ? matchArg(lang, entity, op, idF, idLit) :
      'update' === op ? updateArg(lang, entity, idF, idLit) : ''
    if (arg && 'nil' !== arg) call.expr = withArg(lang, call.expr, arg)
    return BINDING[lang]({ ...call, resultVar: resultName(op, entityVar) })
  }).join('\n')
}
