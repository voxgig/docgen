"use strict";
/* Copyright (c) 2024-2026 Voxgig Ltd, MIT License */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const content_1 = require("../dist/content");
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
};
function model(withContract) {
    const point = { method: 'GET', orig: '/things', active: true };
    if (withContract) {
        point.contract = { version: 1, id: 'GET /things', json: JSON.stringify(FACTS) };
    }
    return {
        name: 'thing', def: 'thing.json',
        main: { kit: {
                info: { title: 'Thing', version: '1', servers: [{ url: 'https://api.example.com' }] },
                entity: { thing: { name: 'thing', active: true, fields: [],
                        op: { list: { name: 'list', points: [point] } } } },
                target: {}, feature: {}, doc: {},
            } },
    };
}
const RESOLVED = {
    version: 1, kind: 'openapi3', def: {},
    operation: (method, path) => ('GET' === method && '/things' === path) ? FACTS : undefined,
};
const EDITION = { name: 'summary', kind: 'summary', title: 'Thing', output: { path: 'SUMMARY.md' } };
(0, node_test_1.describe)('resolved-parity', () => {
    (0, node_test_1.test)('the summary is the same from the capability as from the contract', () => {
        const fromContract = (0, content_1.summary)((0, content_1.view)(model(true), EDITION));
        const fromCapability = (0, content_1.summary)((0, content_1.view)(model(false), EDITION, RESOLVED));
        node_assert_1.default.equal(fromCapability, fromContract);
    });
    (0, node_test_1.test)('the capability wins when both are present', () => {
        // A model that still carries contracts must render from the capability,
        // or the two sources could disagree silently during the transition.
        const both = (0, content_1.summary)((0, content_1.view)(model(true), EDITION, RESOLVED));
        node_assert_1.default.equal(both, (0, content_1.summary)((0, content_1.view)(model(true), EDITION)));
    });
    (0, node_test_1.test)('with neither, rendering still succeeds', () => {
        // A point with no contract and no capability has no facts to state; it
        // must not throw.
        node_assert_1.default.equal('string', typeof (0, content_1.summary)((0, content_1.view)(model(false), EDITION)));
    });
});
//# sourceMappingURL=resolved-parity.test.js.map