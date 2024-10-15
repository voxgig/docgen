"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const code_1 = require("@hapi/code");
const aontu_1 = require("aontu");
const memfs_1 = require("memfs");
const jostraca_1 = require("jostraca");
const __1 = require("../");
const Main_1 = require("../dist/web/Main");
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
            '/top/doc/web/index.html': '\n<html>\n<head>\n</head>\n<body>\n<h1>DOC</h1>\n</body>\n</html>\n',
            '/top/.jostraca/jostraca.json.log': voljson['/top/.jostraca/jostraca.json.log'],
        });
    });
    function makeModel() {
        return (0, aontu_1.Aontu)(`
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
            const { model } = props;
            (0, jostraca_1.Project)({ model, folder: model.main.doc.folder.name }, () => {
                (0, Main_1.Main)({});
            });
        });
    }
});
//# sourceMappingURL=docgen.test.js.map