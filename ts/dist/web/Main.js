"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const jostraca_1 = require("jostraca");
const Main = (0, jostraca_1.cmp)(function Main(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    const { entity } = model.main.sdk;
    (0, jostraca_1.Content)(`
<h1> ${model.Name} SDK Documentation</h1>
`);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
  <h2>${entity.Name}</h2>
`);
    });
});
exports.Main = Main;
//# sourceMappingURL=Main.js.map