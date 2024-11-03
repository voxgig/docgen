"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Index = void 0;
const jostraca_1 = require("jostraca");
const Main_1 = require("./Main");
const Index = (0, jostraca_1.cmp)(function Index(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    // console.log('Index', model.test)
    (0, jostraca_1.Folder)({ name: 'static' }, () => {
        (0, jostraca_1.Folder)({ name: 'src' }, () => {
            // TODO: need to be able to resolve fragments from source folder too
            if (!model.test) {
                (0, jostraca_1.Copy)({ from: `${__dirname}/../../src/static/header.html`, exclude: true });
                (0, jostraca_1.Copy)({ from: `${__dirname}/../../src/static/footer.html`, exclude: true });
                (0, jostraca_1.Copy)({ from: `${__dirname}/../../src/static/index.css`, exclude: true });
            }
        });
        (0, jostraca_1.Folder)({ name: 'dist' }, () => {
            (0, jostraca_1.File)({ name: 'index.html' }, () => {
                (0, jostraca_1.Content)(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>
    <style>
`);
                // TODO: need to be able to resolve fragments from source folder too
                if (!model.test) {
                    (0, jostraca_1.Fragment)({ from: `../../src/index.css`, indent: '      ' });
                }
                (0, jostraca_1.Content)(`
    </style>
  </head>
  <body>
   <header>
     <template shadowrootmode="open">
`);
                if (!model.test) {
                    (0, jostraca_1.Fragment)({ from: `../../src/header.html`, indent: '      ' });
                }
                (0, jostraca_1.Content)(`
     </template>
   </header>

   <main class="content space-y-8">
     <template shadowrootmode="open">
`);
                (0, Main_1.Main)({});
                (0, jostraca_1.Content)(`
     </template>
   </main>

   <footer>
     <template shadowrootmode="open">
`);
                if (!model.test) {
                    (0, jostraca_1.Fragment)({ from: `../../src/footer.html`, indent: '      ' });
                }
                (0, jostraca_1.Content)(`
     </template>
   </footer>
  </body>
</html>
`);
            });
        });
    });
});
exports.Index = Index;
//# sourceMappingURL=Index.js.map