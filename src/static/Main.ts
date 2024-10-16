
import { cmp, each, File, Folder, Content, Fragment } from 'jostraca'

import { resolvePath } from '../utility'


const Main = cmp(function Main(props: any) {
  const { ctx$ } = props
  const { model } = ctx$

  const { entity } = model.main.sdk

  Content(`
<h1> ${model.Name} SDK Documentation</h1>
`)

  each(entity, (entity: any) => {
    Content(`
  <h2>${entity.Name}</h2>
`)
  })

})


export {
  Main
}
