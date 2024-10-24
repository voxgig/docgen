
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
        '\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <script src="https://cdn.tailwindcss.com"></script>\n    <style>\n\n    </style>\n  </head>\n  <body>\n   <header>\n     <template shadowrootmode="open">\n\n     </template>\n   </header>\n\n   <main>\n     <template shadowrootmode="open">\n\n<style>\n @import url(\'index.css\');\n\n h1 {\n  background: linear-gradient(to right, var(--c3), var(--c1));\n  background-clip: text;\n  color: transparent;\n}\n\n.sidebar {\n  width: 10rem;\n  padding: var(--s4);\n  background-color: var(--c2);\n  color: var(--c1);\n  border-right: 1px solid var(--c3);\n  position: sticky;\n  top: 0;\n  height: 100vh;\n  overflow: auto;\n  z-index: 0;\n}\n\n.content {\n  flex: 1;\n  padding: var(--s4);\n  overflow-y: auto;\n}\n\n.content-section {\n  display: block;\n  margin-bottom: var(--s2);\n  color: var(--c1);\n}\n\n.content-section:hover {\n  cursor: pointer;\n  color: var(--c3);\n}\n\npre {\n  background-color: var(--c1);\n  border-radius: var(--s1);\n  padding: var(--s3);\n  margin-bottom: var(--s4)\n}\n\ncode {\n  color: var(--c2);\n  font-family: var(--ff1);\n}\n\n.lang-section {\n  color: var(--c3);\n}\n\n.toggle-button {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: var(--s2);\n  margin-bottom: var(--s4);\n  background-color: var(--c3);\n  color: var(--c2);\n  border: none;\n  border-radius: var(--s3);\n  cursor: pointer;\n  transition: background-color 0.3s ease;\n}\n\n.toggle-button:hover {\n  background-color: var(--c1);\n}\n\n.sun-icon,\n.moon-icon {\n  display: none;\n}\n\n.light-mode .moon-icon {\n  display: inline-block;\n}\n\n.dark-mode .sun-icon {\n  display: inline-block;\n}\n</style>\n\n\n<!-- Sidebar -->\n\n<nav class="sidebar">\n  <button class="toggle-button content-section light-mode">\n    <!-- Moon icon for toggling to dark mode -->\n    <svg class="moon-icon" width="30" height="30" id="dark-icon">\n      <path fill="currentColor" d="M 23, 5 A 12 12 0 1 0 23, 25 A 12 12 0 0 1 23, 5" />\n    </svg>\n\n    <!-- Sun icon for toggling to light mode -->\n    <svg class="sun-icon" width="30" height="30" id="light-icon">\n      <circle cx="15" cy="15" r="6" fill="currentColor" />\n      <line id="ray" stroke="currentColor" stroke-width="2" stroke-linecap="round" x1="15" y1="1" x2="15" y2="4" />\n      <use href="#ray" transform="rotate(45 15 15)" />\n      <use href="#ray" transform="rotate(90 15 15)" />\n      <use href="#ray" transform="rotate(135 15 15)" />\n      <use href="#ray" transform="rotate(180 15 15)" />\n      <use href="#ray" transform="rotate(225 15 15)" />\n      <use href="#ray" transform="rotate(270 15 15)" />\n      <use href="#ray" transform="rotate(315 15 15)" />\n    </svg>\n  </button>\n\n  <a class="content-section" data-target="introduction">\n   <h2>Introduction</h2>\n  </a>\n         \n</nav>\n\n<!-- End Sidebar -->\n\n\n\n\n<div class="content">\n<h1> undefined SDK Documentation</h1>\n\n  <main>\n    <section id="introduction">\n      <h2>Introduction</h2>\n      <p>Welcome to the undefined SDK documentation. This guide will help you integrate and use our SDK effectively.</p>\n    </section>\n\n         \n  </section>\n<!-- End Go Section -->\n\n  </section>\n  </div>\n</main>\n          \n     </template>\n   </main>\n\n   <footer>\n     <template shadowrootmode="open">\n      <style>\n        hr {\n          border: 0;\n          height: var(--s1); /* Adjust the height to your preference */\n          background-image: linear-gradient(to right, var(--c1), var(--c2), var(--c3));\n        }\n      </style>\n\n     </template>\n   </footer>\n   <script>\n        document.addEventListener("DOMContentLoaded", () => {\n        const mainShadowRoot = document.querySelector("main").shadowRoot;\n        // const footerShadowRoot = document.querySelector("footer").shadowRoot;\n\n        if (mainShadowRoot) {\n         mainShadowRoot.querySelectorAll(".content-section").forEach((section) => {\n            section.addEventListener("click", function () {\n              const targetID = this.getAttribute("data-target");\n              const targetSection = mainShadowRoot.querySelector(`#${targetID}`);\n              if (targetSection) {\n                targetSection.scrollIntoView({ behavior: "smooth" });\n              }\n            });\n          });\n\n          const toggleButton = mainShadowRoot.querySelector(".toggle-button");\n          toggleButton.addEventListener("click", () => {\n            mainShadowRoot.host.classList.toggle("dark-mode");\n            if (mainShadowRoot.host.classList.contains(\'dark-mode\')) {\n              toggleButton.classList.remove(\'light-mode\');\n              toggleButton.classList.add(\'dark-mode\');\n            } else {\n              toggleButton.classList.remove(\'dark-mode\');\n              toggleButton.classList.add(\'light-mode\');\n            }\n          });\n        }\n\n        // if (footerShadowRoot) {\n        // }\n      });\n   </script>\n  </body>\n</html>\n',
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

