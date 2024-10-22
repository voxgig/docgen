"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const code_1 = require("@hapi/code");
const aontu_1 = require("aontu");
const memfs_1 = require("memfs");
const jostraca_1 = require("jostraca");
const __1 = require("../");
const Index_1 = require("../dist/static/Index");
(0, node_test_1.describe)('docgen', () => {
    (0, node_test_1.test)('happy', async () => {
        (0, code_1.expect)(__1.DocGen).exist();
        const { fs, vol } = (0, memfs_1.memfs)({});
        const docgen = (0, __1.DocGen)({
            fs, folder: '/top', root: ''
        });
        (0, code_1.expect)(docgen).exist();
        const root = makeRoot();
        const model = makeModel();
        // console.log('MODEL', model)
        const spec = {
            model,
            root
        };
        await docgen.generate(spec);
        const voljson = vol.toJSON();
        (0, code_1.expect)(JSON.parse(voljson['/top/.jostraca/jostraca.json.log']).exclude).equal([]);
        (0, code_1.expect)(voljson).equal({
            '/top/doc/static/src': null,
            '/top/doc/static/dist/index.html': `\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <script src="https://cdn.tailwindcss.com"></script>\n    <style>\n\n    </style>\n  </head>\n  <body>\n   <header>\n     <template shadowrootmode="open">\n\n     </template>\n   </header>\n\n   <main class="container mx-auto">\n     <template shadowrootmode="open">\n\n<style>\n @import url('index.css');\na {\n  color: var(--c3);\n}\n\npre {\n  background-color: var(--c1);\n  border-radius: var(--s1);\n}\n\ncode {\n  color: var(--c2);\n  font-family: var(--ff1);\n}\n</style>\n<h1> undefined SDK Documentation</h1>\n\n<div>\n  <main>\n    <section id="introduction">\n      <h2>Introduction</h2>\n      <p>Welcome to the undefined SDK documentation. This guide will help you integrate and use our SDK effectively.</p>\n      <a href="">Template Link</a>\n    </section>\n    <section id="getting-started">\n      <h2>Getting Started</h2>\n\n      <h3>Install SDK</h3>\n      <div>\n        <h4>JavaScript</h4>\n        <pre><code>\n          npm install foo-sdk\n        </code></pre>\n      </div>\n      <div>\n        <h4>Go</h4>\n        <pre><code>\n          go get foo\n        </code></pre>\n      </div>\n\n      <h3>Initialize SDK</h3>\n      <div>\n        <h4>JavaScript</h4>\n          <pre><code>\n            const client = undefinedSDK.make({\n              })\n          </code></pre>\n        </div>\n      <div>\n        <h4>Go</h4>\n          <pre><code>\n            options := foosdk.Options{\n            }\n          </code></pre>\n        </div>\n      </section>\n    \n     </template>\n   </main>\n\n   <footer>\n     <template shadowrootmode="open">\n\n     </template>\n   </footer>\n  </body>\n</html>\n`,
            '/top/.jostraca/jostraca.json.log': voljson['/top/.jostraca/jostraca.json.log'],
        });
    });
    function makeModel() {
        return (0, aontu_1.Aontu)(`
test: true

name: 'foo'

main: sdk: &: { name: .$KEY }

main: sdk: js: {}

main: sdk: python: {}

main: sdk: java: {}


main: doc: folder: name: 'doc'

`).gen();
    }
    function makeRoot() {
        return (0, jostraca_1.cmp)(function Root(props) {
            const { model, ctx$ } = props;
            ctx$.model = model;
            (0, jostraca_1.Project)({ model, folder: model.main.doc.folder.name }, () => {
                (0, Index_1.Index)({});
            });
        });
    }
});
//# sourceMappingURL=docgen.test.js.map