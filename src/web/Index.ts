
import { cmp, each, File, Folder, Content, Fragment, Copy } from 'jostraca'

import { resolvePath } from '../utility'

import { Main } from './Main'


const Index = cmp(function Index(props: any) {
  const { ctx$ } = props
  const { model } = ctx$

  console.log('Index', model.test)


  Folder({ name: 'web' }, () => {

    Folder({ name: 'src' }, () => {

      // TODO: need to be able to resolve fragments from source folder too
      if (!model.test) {
        Copy({ from: `${__dirname}/../../src/web/header.html`, exclude: true })
        Copy({ from: `${__dirname}/../../src/web/footer.html`, exclude: true })
        Copy({ from: `${__dirname}/../../src/web/index.css`, exclude: true })
      }
    })


    Folder({ name: 'dist' }, () => {

      File({ name: 'index.html' }, () => {

        Content(`
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
`)

        // TODO: need to be able to resolve fragments from source folder too
        if (!model.test) {
          Fragment({ from: `../../src/index.css`, indent: '      ' })
        }

        Content(`
    </style>
  </head>
  <body>
   <header>
     <template shadowrootmode="open">
`)

        if (!model.test) {
          Fragment({ from: `../../src/header.html`, indent: '      ' })
        }

        Content(`
     </template>
   </header>

   <main>
     <template shadowrootmode="open">

`)

        Main({})

        Content(`
     </template>
   </main>

   <footer>
     <template shadowrootmode="open">
`)

        if (!model.test) {
          Fragment({ from: `../../src/footer.html`, indent: '      ' })
        }

        Content(`
     </template>
   </footer>
  </body>
</html>
`)

      })
    })

  })
})


export {
  Index
}
