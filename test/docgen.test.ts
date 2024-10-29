
import { test, describe } from 'node:test'
import { expect } from '@hapi/code'

import { Aontu } from 'aontu'
import { memfs } from 'memfs'


import { cmp, each, Project, Folder, File, Content } from 'jostraca'

import {
  DocGen,
} from '../'


import {
  Index
} from '../dist/static/Index'



describe('docgen', () => {

  test('happy', async () => {
    expect(DocGen).exist()

    const { fs, vol } = memfs({

    })
    const docgen = DocGen({
      fs, folder: '/top', root: ''
    })
    expect(docgen).exist()

    const root = makeRoot()
    const model = makeModel()
    // console.log('MODEL', model)

    const spec = {
      model,
      root
    }

    await docgen.generate(spec)

    const voljson: any = vol.toJSON()
    expect(JSON.parse(voljson['/top/.jostraca/jostraca.json.log']).exclude).equal([])

    expect(voljson).equal({
      '/top/doc/static/src': null,
      '/top/doc/static/dist/index.html':
        '\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <script src="https://cdn.tailwindcss.com"></script>\n    <style>\n\n    </style>\n  </head>\n  <body>\n   <header>\n     <template shadowrootmode="open">\n\n     </template>\n   </header>\n\n   <main class="content space-y-8">\n     <template shadowrootmode="open">\n\n<style>\n:host {\n  /* Colors */\n  --c1: #ffffff;\n  --c2: #000000;\n  --c3: #85ea2d;\n}\n\nmain {\n  background-color: var(--c2);\n  color: var(--c1);\n}\n\nh1 {\n  background: linear-gradient(to right, var(--c3), var(--c1));\n  background-clip: text;\n  color: transparent;\n}\n\n\n.lang-section {\n  background-color: rgba(17, 24, 39, var(--tw-bg-opacity));\n}\n\n.sidebar-section:hover {\n  color: var(--c3);\n}\n</style>\n\n\n<main class="flex h-screen">\n\n<!-- Sidebar -->\n<aside class="w-64 flex flex-col lang-section bg-opacity-50">\n    <section class="p-4 text-2xl font-bold border-b">\n        <h1>undefined SDK</h1>\n    </section>\n\n  <nav class="flex-1 p-4 space-y-4">\n  <section>\n    <button \n    class="sidebar-section cursor-pointer w-full text-left flex items-center justify-between font-semibold hover:bg-gray-800 p-2 rounded-md"\n    data-target="#section-intro"\n    >\n     Introduction\n    </button>\n  </section>\n           \n  </nav>\n</aside>\n\n<!-- End Sidebar -->\n\n\n\n\n<div class="flex flex-col overflow-y-auto p-4 w-full">\n<h1 class="text-5xl font-extrabold text-center tracking-wide my-4 p-10 shadow-sm"> undefined SDK Documentation</h1>\n\n  <div>\n    <section id="section-intro" class="w-2/3 mx-auto shadow-sm my-20">\n      <h2 class="text-3xl font-bold mb-4">Introduction</h2>\n      <p class="text-lg leading-relaxed">Welcome to the undefined SDK documentation. This guide will help you integrate and use our SDK effectively.</p>\n    </section>\n\n         \n    </section>\n  </section>\n<!-- End Ruby Section -->\n\n  </section>\n  </div>\n  </div>\n</main>\n\n          \n     </template>\n   </main>\n\n   <footer>\n     <template shadowrootmode="open">\n       <style>\n          hr {\n            border: 0;\n            height: var(--s1);\n            /* Adjust the height to your preference */\n            background-image: linear-gradient(to right, var(--c1), var(--c2), var(--c3));\n          }\n       </style>\n\n\n     </template>\n   </footer>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>\n   <script>\n        document.addEventListener("DOMContentLoaded", () => {\n        const mainShadowRoot = document.querySelector("main").shadowRoot;\n\n        const tailwindLinkEl = document.createElement(\'link\');\n        tailwindLinkEl.rel = \'stylesheet\';\n        tailwindLinkEl.href = \'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css\';\n        mainShadowRoot.appendChild(tailwindLinkEl);\n\n        const prismlinkEl = document.createElement(\'link\');\n        prismlinkEl.rel = \'stylesheet\';\n        prismlinkEl.href = \'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css\';\n        mainShadowRoot.appendChild(prismlinkEl);\n\n        mainShadowRoot.querySelectorAll("pre code").forEach((block) => Prism.highlightElement(block));\n\n        mainShadowRoot.querySelectorAll(".sidebar-section").forEach((el) => {\n          el.addEventListener("click", function () {\n            const targetID = this.getAttribute("data-target")\n            const targetSection = mainShadowRoot.querySelector(targetID);\n\n            if (targetSection) {\n              targetSection.scrollIntoView({ behavior: "smooth" });\n            } else {\n              console.error(`Target section not found: ${targetID}`)\n            }\n          });\n        });\n\n          // Toggle the sidebar visibility of sections\n          mainShadowRoot.querySelectorAll(".side-nav-btn").forEach(button => {\n            button.addEventListener(\'click\', function () {\n              const targetID = this.getAttribute(\'data-target\');\n              const target = mainShadowRoot.querySelector(targetID);\n              const indicator = this.querySelector(".indicator");\n              if (target) {\n                if (target.classList.contains(\'hidden\')) {\n                  target.classList.remove(\'hidden\');\n                  indicator.textContent = \'-\';\n                } else {\n                  target.classList.add(\'hidden\');\n                  indicator.textContent = \'+\';\n                }\n              } else {\n                console.error(`Sidebar target not found: ${targetID}`);\n              }\n            });\n          });\n\n      });\n   </script>\n  </body>\n</html>\n',
      '/top/.jostraca/jostraca.json.log': voljson['/top/.jostraca/jostraca.json.log'],
    })
  })


  function makeModel() {
    return Aontu(`
test: true

name: 'foo'

main: sdk: &: { name: .$KEY }

main: sdk: js: {}

main: sdk: python: {}

main: sdk: java: {}


main: doc: folder: name: 'doc'

`).gen()
  }


  function makeRoot() {
    return cmp(function Root(props: any) {
      const { model, ctx$ } = props
      ctx$.model = model

      Project({ model, folder: model.main.doc.folder.name }, () => {
        Index({})
      })
    })
  }

})

