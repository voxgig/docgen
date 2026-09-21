"use strict";
/* Copyright (c) 2024-2026 Voxgig Ltd, MIT License */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const content_1 = require("../dist/content");
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
};
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
    };
}
const RESOLVED = {
    operation: (method, path) => ('GET' === method && '/things' === path) ? FACTS : undefined,
};
const EDITION = { name: 'summary', kind: 'summary', title: 'Thing', output: { path: 'SUMMARY.md' } };
(0, node_test_1.test)('compact model renders specification facts and active routes across editions', () => {
    const v = (0, content_1.view)(model(), EDITION, RESOLVED);
    const text = (0, content_1.summary)(v);
    strict_1.default.match(text, /Thing records/);
    strict_1.default.match(text, /Alpha detail/);
    strict_1.default.doesNotMatch(text, /\/hidden|undefined/);
    const reference = (0, content_1.pages)(v, {}).find(p => p.path === 'api/thing').markdown;
    strict_1.default.match(reference, /listThings/);
    strict_1.default.match(reference, /Authentication: bearer token/);
    strict_1.default.match(reference, /\| `alpha` \| `string` \| Yes \| Alpha \|/);
    strict_1.default.doesNotMatch(reference, /`hidden`/);
    strict_1.default.ok(reference.indexOf('`alpha`') < reference.indexOf('`zebra`'));
    strict_1.default.ok(reference.indexOf('"alpha"') < reference.indexOf('"zebra"'));
    strict_1.default.doesNotMatch((0, content_1.pages)(v, {}).find(p => p.path === 'guides/first-call').markdown, /\/hidden/);
    strict_1.default.doesNotMatch((0, content_1.slides)(v, ''), /\/hidden|undefined/);
});
(0, node_test_1.test)('model-only rendering omits unavailable specification facts', () => {
    const v = (0, content_1.view)(model(), EDITION);
    strict_1.default.equal(typeof (0, content_1.summary)(v), 'string');
    strict_1.default.doesNotMatch((0, content_1.pages)(v, {}).find(p => p.path === 'api/thing').markdown, /listThings|bearer token/);
});
//# sourceMappingURL=resolved-parity.test.js.map