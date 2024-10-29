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
            '/top/doc/static/dist/index.html': '\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <script src="https://cdn.tailwindcss.com"></script>\n    <style>\n\n    </style>\n  </head>\n  <body>\n   <header>\n     <template shadowrootmode="open">\n\n     </template>\n   </header>\n\n   <main class="content space-y-8">\n     <template shadowrootmode="open">\n\n<style>\n:host {\n  /* Colors */\n  --c1: #ffffff;\n  --c2: #000000;\n  --c3: #85ea2d;\n}\n\n/* Generic Styles */\nhtml {\n  box-sizing: border-box;\n}\n\n*,\n*::before,\n*::after {\n  box-sizing: inherit;\n}\n\nbody {\n  background-color: var(--c2);\n  color: var(--c1);\n}\n\nmain,\nfooter {\n  background-color: var(--c2);\n  color: var(--c1);\n}\n\nmain {\n  display: flex;\n  height: 100vh;\n}\n\nh1 {\nbackground: linear-gradient(to right, var(--c3), var(--c1));\nbackground-clip: text;\ncolor: transparent;\n}\n\n.sidebar {\n  width: 10rem;\n  color: var(--c1);\n  border-right: 1px solid var(--c3);\n  position: sticky;\n  top: 0;\n  height: 100vh;\n  overflow: auto;\n  z-index: 0;\n}\n\n.content-section {\n  display: block;\n}\n\n.content-section:hover {\n  cursor: pointer;\n  color: var(--c3);\n}\n\npre {\n  background-color: var(--c1);\n}\n\n.lang-section {\n  background-color: rgba(17, 24, 39, var(--tw-bg-opacity));\n}\n</style>\n\n\n<main>\n\n<!-- Sidebar -->\n<nav class="sidebar">\n  <a class="content-section" data-target="introduction">\n   <h2>Introduction</h2>\n  </a>\n         \n</nav>\n\n<!-- End Sidebar -->\n\n\n\n\n<div class="flex flex-col overflow-y-auto p-4 w-full">\n<h1 class="text-5xl font-extrabold text-center tracking-wide my-4 shadow-sm"> undefined SDK Documentation</h1>\n\n  <div>\n    <section id="introduction" class="w-2/3 mx-auto shadow-sm my-20">\n      <h2 class="text-3xl font-bold mb-4">Introduction</h2>\n      <p class="text-lg leading-relaxed">Welcome to the undefined SDK documentation. This guide will help you integrate and use our SDK effectively.</p>\n    </section>\n\n         \n    </section>\n  </section>\n<!-- End Ruby Section -->\n\n  </section>\n  </div>\n  </div>\n</main>\n\n          \n     </template>\n   </main>\n\n   <footer>\n     <template shadowrootmode="open">\n       <style>\n          hr {\n            border: 0;\n            height: var(--s1);\n            /* Adjust the height to your preference */\n            background-image: linear-gradient(to right, var(--c1), var(--c2), var(--c3));\n          }\n       </style>\n\n\n     </template>\n   </footer>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>\n   <script>\n        document.addEventListener("DOMContentLoaded", () => {\n        const mainShadowRoot = document.querySelector("main").shadowRoot;\n\n        const tailwindLinkEl = document.createElement(\'link\');\n        tailwindLinkEl.rel = \'stylesheet\';\n        tailwindLinkEl.href = \'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css\';\n        mainShadowRoot.appendChild(tailwindLinkEl);\n\n        const prismlinkEl = document.createElement(\'link\');\n        prismlinkEl.rel = \'stylesheet\';\n        prismlinkEl.href = \'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css\';\n        mainShadowRoot.appendChild(prismlinkEl);\n\n        mainShadowRoot.querySelectorAll("pre code").forEach((block) => Prism.highlightElement(block));\n\n        if (mainShadowRoot) {\n         mainShadowRoot.querySelectorAll(".content-section").forEach((section) => {\n            section.addEventListener("click", function () {\n              const targetID = this.getAttribute("data-target");\n              const targetSection = mainShadowRoot.querySelector(`#${targetID}`);\n              if (targetSection) {\n                targetSection.scrollIntoView({ behavior: "smooth" });\n              }\n            });\n          });\n\n          // const toggleButton = mainShadowRoot.querySelector(".toggle-button");\n          // toggleButton.addEventListener("click", () => {\n          //   mainShadowRoot.host.classList.toggle("dark-mode");\n          //   if (mainShadowRoot.host.classList.contains(\'dark-mode\')) {\n          //     toggleButton.classList.remove(\'dark-mode\');\n          //     toggleButton.classList.add(\'light-mode\');\n          //   } else {\n          //     toggleButton.classList.remove(\'light-mode\');\n          //     toggleButton.classList.add(\'dark-mode\');\n          //   }\n          // });\n        }\n      });\n   </script>\n  </body>\n</html>\n',
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