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
            '/top/doc/static/dist/index.html': `\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <script src="https://cdn.tailwindcss.com"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>\n    <style>\n\n    </style>\n  </head>\n  <body>\n   <header>\n     <template shadowrootmode="open">\n\n     </template>\n   </header>\n\n   <main class="content space-y-8">\n     <template shadowrootmode="open">\n\n<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">\n<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">\n<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css" rel="stylesheet">\n\n<style>\n.lg-header {\n  background: linear-gradient(to right, var(--c3), var(--c1));\n  background-clip: text;\n  color: transparent;\n}\n\n.side-get-start-sect:hover {\n  color: var(--c3);\n}\n\n.sidebar-section:hover {\n  color: var(--c3);\n}\n</style>\n\n\n<main class="flex flex-col md:flex-row md:h-screen">\n<aside class="w-full md:w-64 p-6 md:p-0 flex flex-col md:sticky md:overflow-y-auto">\n    <section class="p-3 text-2xl font-bold border-none md:border-b">\n        <h1 class="lg-header hidden md:block">undefined SDK</h1>\n    </section>\n  <button class="side-get-start-nav-btn text-2xl w-full text-left flex items-center justify-between font-semibold p-2 md:hidden" data-target="#sections-mobile"> \n      Sections\n      <span class="indicator">+</span>\n  </button>\n  <nav id="sections-mobile" class="flex-1 p-4 space-y-4 hidden md:block">\n  <section>\n    <button \n    class="sidebar-section cursor-pointer w-full text-left flex items-center justify-between font-semibold p-2"\n    data-target="#section-intro"\n    >\n     Introduction\n    </button>\n  </section>\n\n\n<section class="group">\n  <button class="side-get-start-nav-btn w-full text-left flex items-center justify-between font-semibold p-2" data-target="#side-get-start-sect">\n    Getting Started\n    <span class="indicator">+</span>\n  </button>\n  <section id="side-get-start-sect" class="hidden pl-4 space-y-2">\n  </section>\n</section>\n           \n  </nav>\n</aside>\n         \n<div class="flex flex-col overflow-y-auto p-4 w-full">\n  <h1 class="lg-header text-4xl md:text-5xl break-words font-extrabold text-center tracking-wide my-4 p-10"> undefined SDK Documentation</h1>\n\n  <div class="w-full md:w-3/4 mx-auto p-6 my-20">\n    <section id="section-intro" class="my-10">\n      <h2 class="text-3xl font-bold my-4">Introduction</h2>\n      <p class="text-lg leading-relaxed">Welcome to the undefined SDK documentation. This guide will help you integrate and use our SDK effectively.</p>\n    <p class="text-lg leading-relaxed mb-4">\n      This comprehensive documentation will guide you through the undefined SDK, designed to simplify integration with our APIs.\n      Whether working with multiple languages, you'll find everything you need to\n      get started and efficiently manage its business entities.\n    </p>\n    <p class="text-lg leading-relaxed mb-4">\n      The undefined SDK adopts an entity-oriented approach, mapping business logic directly to your code without the need to \n      handle individual endpoint paths. With this SDK, you can create multiple concurrent client instances, each providing\n      intuitive methods for managing and interacting with your business entities.\n    </p>\n    <p class="text-lg leading-relaxed">\n      Browse the sections below to explore how to install, initialize, and use the SDK for each supported language.\n    </p>\n    </section>\n  </div>\n         \n  <div class="w-full md:w-3/4 mx-auto p-6 lg:my-20" >\n      <h2 class="text-3xl font-bold my-4">Getting Started</h2>\n</div>\n\n<div class="w-full md:w-3/4 mx-auto md:p-6">\n  <h2 class="text-3xl font-bold my-4">Entities</h2>\n</div>\n        \n  </div>\n</main>\n          \n     </template>\n   </main>\n\n   <footer>\n     <template shadowrootmode="open">\n\n     </template>\n   </footer>\n   <script>\n        document.addEventListener("DOMContentLoaded", () => {\n        const mainShadowRoot = document.querySelector("main").shadowRoot;\n\n        mainShadowRoot.querySelectorAll("pre code").forEach((block) => Prism.highlightElement(block));\n\n        mainShadowRoot.querySelectorAll(".side-get-start-sect, .sidebar-section").forEach((el) => {\n          el.addEventListener("click", function () {\n            const targetID = this.getAttribute("data-target")\n            const targetSection = mainShadowRoot.querySelector(targetID);\n\n            if (targetSection) {\n              targetSection.scrollIntoView({ behavior: "smooth" });\n            } \n          });\n        });\n\n        mainShadowRoot.querySelectorAll(".sections-mobile, .side-nav-btn, .side-get-start-nav-btn").forEach(button => {\n          button.addEventListener('click', function () {\n            const targetID = this.getAttribute('data-target');\n            const target = mainShadowRoot.querySelector(targetID);\n            const indicator = this.querySelector(".indicator");\n            if (target) {\n              if (target.classList.contains('hidden')) {\n                target.classList.remove('hidden');\n                indicator.textContent = '-';\n              } else {\n                target.classList.add('hidden');\n                indicator.textContent = '+';\n              }\n            } \n          });\n        });\n        \n      });\n   </script>\n  </body>\n</html>\n`,
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