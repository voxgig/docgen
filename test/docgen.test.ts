
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
        `\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <script src="https://cdn.tailwindcss.com"></script>\n    <style>\n\n    </style>\n  </head>\n  <body>\n   <header>\n     <template shadowrootmode="open">\n\n     </template>\n   </header>\n\n   <main class="container mx-auto">\n     <template shadowrootmode="open">\n\n<style>\n @import url('index.css');\n\n h1 {\n      background: linear-gradient(to right, var(--c3), var(--c1));\n      -webkit-background-clip: text;\n      background-clip: text;\n      color: transparent;\n}\n\npre {\n  background-color: var(--c1);\n  border-radius: var(--s1);\n}\n\ncode {\n  color: var(--c2);\n  font-family: var(--ff1);\n}\n\n.lang-section {\n  color: var(--c3);\n}\n</style>\n<h1> undefined SDK Documentation</h1>\n\n  <main>\n    <section id="introduction">\n      <h2>Introduction</h2>\n      <p>Welcome to the undefined SDK documentation. This guide will help you integrate and use our SDK effectively.</p>\n    </section>\n\n\n<!-- JavaScript Section -->\n\n    <section id="JavaScript">\n      <h1>JavaScript</h1>\n\n      <h2>Getting Started</h2>\n\n      <h3>1. Install SDK</h3>\n      <pre><code>\n          npm install foo-sdk\n      </code></pre>\n\n      <h3>2. Initialize SDK</h3>\n          <pre><code>\n            const client = undefinedSDK.make({\n              })\n          </code></pre>\n    \n  </section>\n\n\n<!-- Go Section -->\n\n<section id="Go">\n      <h1>Go</h1>\n      <h2>Getting Started</h2>\n      <h3 class="steps">1. Install SDK</h3>\n      <pre><code>\n        go get foo\n      </code></pre>\n\n      <h3 class="steps">2. Initialize SDK</h3>\n          <pre><code>\n            options := foosdk.Options{\n            }\n          </code></pre>\n    \n</main>\n          \n     </template>\n   </main>\n\n   <footer>\n     <template shadowrootmode="open">\n      <style>\n        hr {\n          border: 0;\n          height: var(--s1); /* Adjust the height to your preference */\n          background-image: linear-gradient(to right, var(--c1), var(--c2), var(--c3));\n        }\n      </style>\n\n     </template>\n   </footer>\n  </body>\n</html>\n`,
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

