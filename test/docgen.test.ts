
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
      fs: () => fs, folder: '/top', root: ''
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
    expect(JSON.parse(voljson['/top/.jostraca/jostraca.meta.log']).last > 0).equal(true)

    expect(voljson).includes({
      '/top/doc/static/src': null,
      '/top/doc/static/dist/index.html':
        '\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <script src="https://cdn.tailwindcss.com"></script>\n    <style>\n\n    </style>\n  </head>\n  <body>\n   <header>\n     <template shadowrootmode="open">\n\n     </template>\n   </header>\n\n   <main>\n     <template shadowrootmode="open">\n\n\n<h1> undefined SDK Documentation</h1>\n\n     </template>\n   </main>\n\n   <footer>\n     <template shadowrootmode="open">\n\n     </template>\n   </footer>\n  </body>\n</html>\n',
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

