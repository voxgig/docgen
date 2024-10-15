
import { cmp, File, Folder, Content } from 'jostraca'

import { resolvePath } from '../utility'


const Main = cmp(function Main(props: any) {
  const { build, ctx$ } = props
  const { model } = ctx$

  Folder({ name: 'web' }, () => {

    File({ name: 'index.html' }, () => {

      Content(`
<html>
<head>
</head>
<body>
<h1>DOC</h1>
</body>
</html>
`)

    })

  })
})


export {
  Main
}
