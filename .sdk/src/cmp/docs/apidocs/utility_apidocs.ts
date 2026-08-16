// Shared reads of the model, in one place so every page agrees about what
// "an installed SDK", "an active feature" and "a documented entity" mean.

import { entityCollection } from '@voxgig/sdkgen'

// The SDK targets a project actually has, in the order its own model asks
// for (`main.kit.config.docs_order`), with anything unlisted appended
// alphabetically. The site's language tabs and SDK pages follow that order,
// so the docs read the way the project's own README does.
function activeTargets(model: any): any[] {
  const targets = model?.main?.kit?.target ?? {}

  const names = Object.keys(targets)
    .filter((name: string) => false !== targets[name]?.active)

  // A docs item is ABOUT the targets, so it must not list itself or any
  // other docs item — they live in a different collection, which is exactly
  // why docs is its own kind.
  const order: string[] = model?.main?.kit?.config?.docs_order ?? []

  const ranked = names.slice().sort((a: string, b: string) => {
    const ai = order.indexOf(a)
    const bi = order.indexOf(b)

    if (0 <= ai && 0 <= bi) return ai - bi
    if (0 <= ai) return -1
    if (0 <= bi) return 1
    return a < b ? -1 : a > b ? 1 : 0
  })

  return ranked.map((name: string) => targets[name])
}


// The entities to document, as an ARRAY in stable order.
//
// `entityCollection` hands back the model node keyed by name, so a caller
// that treats it as a list gets `undefined` for `.length` and iterates
// nothing — which is exactly how this site first generated with no API
// section. Flattened in one place so no page can make that mistake again.
function activeEntities(model: any): any[] {
  const coll: any = entityCollection(model) ?? {}

  return Object.keys(coll).sort()
    .map((name: string) => coll[name])
    .filter((entity: any) => null != entity && false !== entity.active)
}


// Features a project has SELECTED. `active` defaults to false in the base
// schema, so this is the set someone deliberately turned on.
function activeFeatures(model: any): any[] {
  const features = model?.main?.kit?.feature ?? {}

  return Object.keys(features).sort()
    .filter((name: string) => false !== features[name]?.active)
    .map((name: string) => features[name])
}


// A one-line description for an entity, from the API's own definition.
// EMPTY rather than invented when the spec says nothing: a page that admits
// it has no description is more use than one carrying a sentence the API
// author never wrote.
function entityDesc(model: any, entity: any): string {
  const desc = model?.main?.kit?.info?.entity_desc ?? {}

  return String(desc[entity.name] ?? entity.desc ?? entity.short ?? '').trim()
}


// The operations an entity supports, as plain names, for a table.
function opNames(entity: any): string[] {
  return Object.keys(entity?.op ?? {}).sort()
}


// EVERY character a line break can be spelled as.
//
// `\n` is the one that gets remembered, and it is not the only one. A JSON
// string — which is what an OpenAPI document is made of — can carry a bare
// `\r`, and PyYAML (what mkdocs parses with) also breaks lines on NEL, LS and
// PS. Any of them inside a single-quoted scalar ends the scalar's line and
// makes the rest of it something else, so a spec containing `a\r---\rtext`
// produces an `mkdocs.yml` that will not load.
//
// One pattern, used by both sanitizers below, because "what counts as a line
// break" is a single fact and this codebase has a habit of writing a rule
// twice and then only fixing one copy. Written as ESCAPES: NEL, LS and PS are
// invisible in an editor, and a reviewer cannot check a character they cannot
// see. A RUN collapses to one space, so a blank line in spec prose does not
// become two.
const BREAK_RE = /(?:\r\n|[\r\n\u0085\u2028\u2029])+/g


// mkdocs' YAML is written by hand here rather than through a YAML library,
// because this package has no runtime dependencies and the values are known.
// Anything interpolated into it goes through this: a value from the API's own
// spec can contain a colon, a quote or a line break, and any of the three ends
// the document early or changes its meaning.
function yamlString(value: any): string {
  return "'" + String(value ?? '')
    .replace(/'/g, "''")
    .replace(BREAK_RE, ' ') + "'"
}


// The same job for Markdown TABLE CELLS: a pipe in spec text would otherwise
// add a column, and a line break would end the row.
function cell(value: any): string {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(BREAK_RE, ' ')
    .trim()
}


export {
  activeEntities,
  activeTargets,
  activeFeatures,
  entityDesc,
  opNames,
  yamlString,
  cell,
}
