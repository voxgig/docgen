import { entityIdField, entityOps, exampleVarName, idLiteral, matchArg, primaryOpCall } from '@voxgig/sdkgen'
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
  return lang in BINDING ? lang : undefined
}

const RESULT_NAME: Record<string, string> = { create: 'created', update: 'updated', remove: 'removed' }

function resultName(lang: ExampleLang, op: string, entityVar: string): string {
  if ('list' === op) return entityVar + 's'
  if ('load' === op) return entityVar
  if (RESULT_NAME[op]) return RESULT_NAME[op]
  return 'py' === lang || 'rb' === lang ? entityVar + '_' + op : entityVar + op.charAt(0).toUpperCase() + op.slice(1)
}

export function entityExample(entity: any, lang: ExampleLang): string {
  const idF = entityIdField(entity), entityVar = exampleVarName(entity.name, lang)
  return entityOps(entity).map(op => {
    const call: Call = primaryOpCall(lang, entity.Name, entityVar, op, idF, entity)
    if ('list' === op) {
      // primaryOpCall lists without a match; a nested entity's list still
      // needs its parent keys, which matchArg carries for every language.
      const match = matchArg(lang, entity, op, idF, idLiteral(entity, op, idF))
      if (match && 'nil' !== match) call.expr = call.expr.replace(/\((?:nil, nil)?\)$/, '(' + match + ('go' === lang ? ', nil' : '') + ')')
    }
    return BINDING[lang]({ ...call, resultVar: resultName(lang, op, entityVar) })
  }).join('\n')
}
