import { cmp, each, Content } from 'jostraca'


import { languagesSpec } from './languagesSpec'


const Sidebar = cmp(function Sidebar(props: any) {
  const { ctx$ } = props
  const { model } = ctx$

  const { entity, build } = model.main.sdk

  Content(`
<aside class="w-full md:w-64 p-6 md:p-0 flex flex-col md:sticky md:overflow-y-auto">
    <section class="p-3 text-2xl font-bold border-none md:border-b">
        <h1 class="lg-header hidden md:block">${model.Name} SDK</h1>
    </section>
  <button class="side-get-start-nav-btn text-2xl w-full text-left flex items-center justify-between font-semibold p-2 md:hidden" data-target="#sections-mobile"> 
      Sections
      <span class="indicator">+</span>
  </button>
  <nav id="sections-mobile" class="flex-1 p-4 space-y-4 hidden md:block">
  <section>
    <button 
    class="sidebar-section cursor-pointer w-full text-left flex items-center justify-between font-semibold p-2"
    data-target="#section-intro"
    >
     Introduction
    </button>
  </section>


<section class="group">
  <button class="side-get-start-nav-btn w-full text-left flex items-center justify-between font-semibold p-2" data-target="#side-get-start-sect">
    Getting Started
    <span class="indicator">+</span>
  </button>
  <section id="side-get-start-sect" class="hidden pl-4 space-y-2">`)
  each(build, (lg: any) => {
    const spec = languagesSpec[lg.name$]
    Content(`
    <a  class="side-get-start-sect cursor-pointer block p-2" data-target="#section-get-start-${spec.name}">${spec.Name}</a>
`)
  })
  Content(`
  </section>
</section>
           `)

  each(entity, (entity: any) => {
    Content(`
<section class="${entity}-group">
  <button class="side-nav-btn w-full text-left flex items-center justify-between font-semibold p-2" data-target="#side-sect-${entity.name}">
    ${entity.Name}
    <span class="indicator">+</span>
  </button>
  <section id="side-sect-${entity.name}" class="hidden pl-4 space-y-2">`)
    each(build, (lg: any) => {
      const spec = languagesSpec[lg.name]
      Content(`
    <a  class="sidebar-section cursor-pointer block p-2" data-target="#section-${entity.name}-${spec.name}">${spec.Name}</a>
`)
    })
    Content(`
  </section>
</section>
          `)
  })

  Content(`
  </nav>
</aside>
         `)
})


export {
  Sidebar
}
