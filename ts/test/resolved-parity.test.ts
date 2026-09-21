/* Copyright (c) 2024-2026 Voxgig Ltd, MIT License */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { view, summary, pages, slides } from '../dist/content'

const FACTS = {
  protocol: 'http', operationId: 'listThings',
  parameters: [{ in: 'query', name: 'q', schema: { type: 'string' } }],
  responses: { 200: { description: 'Thing records', content: { 'application/json': {
    schema: { type: 'object', properties: {
      zebra: { type: 'string' }, alpha: { type: 'string', description: 'Alpha detail.' },
    } }, example: { zebra: 'z', alpha: 'a' },
  } } } },
  security: [{ apiKeyAuth: [] }],
  securitySchemes: { apiKeyAuth: { type: 'http', scheme: 'bearer' } },
}

function model() {
  return {
    name: 'thing',
    main: { kit: {
      info: { title: 'Thing', version: '1', servers: [{ url: 'https://api.example.com' }] },
      entity: { thing: { name: 'thing', active: true, fields: {
        alpha: { n: 'alpha', h: 'Alpha', t: '`$STRING`', r: true },
        hidden: { n: 'hidden', h: 'Hidden', t: '`$STRING`', r: false, a: false },
      }, op: { list: { name: 'list', points: [
        { m: 'DELETE', o: '/hidden', a: false },
        { m: 'GET', o: '/things', a: true },
      ] } } } },
      target: {}, feature: {}, doc: {},
    } },
  }
}
const RESOLVED = {
  operation: (method: string, path: string) =>
    ('GET' === method && '/things' === path) ? FACTS : undefined,
}
const EDITION = { name: 'summary', kind: 'summary', title: 'Thing', output: { path: 'SUMMARY.md' } }

test('compact model renders specification facts and active routes across editions', () => {
  const v = view(model(), EDITION, RESOLVED)
  const text = summary(v)
  assert.match(text, /Thing records/)
  assert.match(text, /Alpha detail/)
  assert.doesNotMatch(text, /\/hidden|undefined/)
  const reference = pages(v, {}).find(p => p.path === 'api/thing')!.markdown
  assert.match(reference, /listThings/)
  assert.match(reference, /Authentication: bearer token/)
  assert.match(reference, /\| `alpha` \| `string` \| Yes \| Alpha \|/)
  assert.doesNotMatch(reference, /`hidden`/)
  assert.ok(reference.indexOf('`alpha`') < reference.indexOf('`zebra`'))
  assert.ok(reference.indexOf('"alpha"') < reference.indexOf('"zebra"'))
  assert.doesNotMatch(pages(v, {}).find(p => p.path === 'guides/first-call')!.markdown, /\/hidden/)
  assert.doesNotMatch(slides(v, ''), /\/hidden|undefined/)
})

test('model-only rendering omits unavailable specification facts', () => {
  const v = view(model(), EDITION)
  assert.equal(typeof summary(v), 'string')
  assert.doesNotMatch(pages(v, {}).find(p => p.path === 'api/thing')!.markdown, /listThings|bearer token/)
})
