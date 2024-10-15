
import { test, describe } from 'node:test'
import { expect } from '@hapi/code'

import { Aontu } from 'aontu'
import { memfs } from 'memfs'


import { cmp, each, Project, Folder, File, Content } from 'jostraca'

import {
  DocGen,
} from '../'


import {
  Main as MainWeb
} from '../dist/web/Main'



describe('docgen', () => {

  test('happy', async () => {
    expect(DocGen).exist()

    const { fs, vol } = memfs({})
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
      '/top/doc/web/index.html':
        '\n<html>\n<head>\n</head>\n<body>\n<h1>DOC</h1>\n</body>\n</html>\n',
      '/top/.jostraca/jostraca.json.log': voljson['/top/.jostraca/jostraca.json.log'],
    })
  })


  function makeModel() {
    return Aontu(`
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
      const { model } = props
      Project({ model, folder: model.main.doc.folder.name }, () => {
        MainWeb({})
      })
    })
  }

})

