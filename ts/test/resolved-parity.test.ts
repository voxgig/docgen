/* Copyright (c) 2024-2026 Voxgig Ltd, MIT License */

import { test, describe } from 'node:test'
import assert from 'node:assert'

import { view, summary } from '../dist/content'


// The capability and the contract must describe the same operation. If they
// diverge, the reference pages change when contracts are removed — which is
// exactly what removing them must not do.

const FACTS = {
  protocol: 'http',
  operationId: 'listThings',
  parameters: [{ in: 'query', name: 'q', schema: { type: 'string' } }],
  responses: { 200: { description: 'ok' } },
  security: [{ apiKeyAuth: [] }],
  securitySource: 'definition',
  securitySchemes: { apiKeyAuth: { type: 'http', scheme: 'bearer' } },
}

function model(withContract: boolean) {
  const point: any = { method: 'GET', orig: '/things', active: true }
  if (withContract) {
    point.contract = { version: 1, id: 'GET /things', json: JSON.stringify(FACTS) }
  }
  return {
    name: 'thing', def: 'thing.json',
    main: { kit: {
      info: { title: 'Thing', version: '1', servers: [{ url: 'https://api.example.com' }] },
      entity: { thing: { name: 'thing', active: true, fields: [],
        op: { list: { name: 'list', points: [point] } } } },
      target: {}, feature: {}, doc: {},
    } },
  }
}

const RESOLVED = {
  version: 1, kind: 'openapi3', def: {},
  operation: (method: string, path: string) =>
    ('GET' === method && '/things' === path) ? FACTS : undefined,
}

const EDITION = { name: 'summary', kind: 'summary', title: 'Thing', output: { path: 'SUMMARY.md' } }


describe('resolved-parity', () => {

  test('the summary is the same from the capability as from the contract', () => {
    const fromContract = summary(view(model(true), EDITION))
    const fromCapability = summary(view(model(false), EDITION, RESOLVED))
    assert.equal(fromCapability, fromContract)
  })

  test('the capability wins when both are present', () => {
    // A model that still carries contracts renders from the capability.
    const both = summary(view(model(true), EDITION, RESOLVED))
    assert.equal(both, summary(view(model(true), EDITION)))
  })

  test('with neither, rendering still succeeds', () => {
    // A point with no contract and no capability has no facts to state; it
    // must not throw.
    assert.equal('string', typeof summary(view(model(false), EDITION)))
  })

})
