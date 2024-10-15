"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const jostraca_1 = require("jostraca");
const Main = (0, jostraca_1.cmp)(function Main(props) {
    const { build, ctx$ } = props;
    const { model } = ctx$;
    (0, jostraca_1.Folder)({ name: 'web' }, () => {
        (0, jostraca_1.File)({ name: 'index.html' }, () => {
            (0, jostraca_1.Content)(`
<html>
<head>
</head>
<body>
<h1>DOC</h1>
</body>
</html>
`);
        });
    });
});
exports.Main = Main;
//# sourceMappingURL=Main.js.map