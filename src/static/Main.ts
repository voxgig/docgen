
import { cmp, each, File, Folder, Content, Fragment } from 'jostraca'

import { resolvePath } from '../utility'

import { Sidebar } from './Sidebar'
import { GettingStarted } from './GettingStarted'
import { Entities } from './Entities'
import { Intro } from './Intro'


const Main = cmp(function Main(props: any) {
  const { ctx$ } = props
  const { model } = ctx$


  Content(`
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css" rel="stylesheet">

<style>
.lg-header {
  background: linear-gradient(to right, var(--c3), var(--c1));
  background-clip: text;
  color: transparent;
}

.side-get-start-sect:hover {
  color: var(--c3);
}

.sidebar-section:hover {
  color: var(--c3);
}
</style>


<main class="flex flex-col md:flex-row md:h-screen">
`)
  Sidebar({ ctx$ })
  Content(`
<div class="flex flex-col overflow-y-auto p-4 w-full">
  <h1 class="lg-header text-4xl md:text-5xl break-words font-extrabold text-center tracking-wide my-4 p-10"> ${model.Name} SDK Documentation</h1>
     `)
  Intro({ ctx$ })

  GettingStarted({ ctx$ })

  Entities({ ctx$ })

  Content(`
  </div>
</main>
          `)
})

export {
  Main
}
