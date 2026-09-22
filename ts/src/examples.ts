import { OP_SUFFIX, entityIdField, entityOps, exampleVarName, idLiteral, matchArg, primaryOpCall } from '@voxgig/sdkgen'
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

export function entityExample(entity: any, lang: ExampleLang): string {
  const idF = entityIdField(entity), entityVar = exampleVarName(entity.name, lang)
  return methodOps(entity).map(op => {
    const call: Call = primaryOpCall(lang, entity.Name, entityVar, op, idF, entity)
    if ('list' === op) {
      // primaryOpCall lists without a match; a nested entity's list still
      // needs its parent keys, which matchArg carries for every language.
      const match = matchArg(lang, entity, op, idF, idLiteral(entity, op, idF))
      if (match && 'nil' !== match) call.expr = call.expr.replace(/\((?:nil, nil)?\)$/, '(' + match + ('go' === lang ? ', nil' : '') + ')')
    }
    return BINDING[lang]({ ...call, resultVar: resultName(op, entityVar) })
  }).join('\n')
}
