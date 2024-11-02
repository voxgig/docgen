
import { cmp, each, File, Folder, Content, Fragment } from 'jostraca'

import { resolvePath } from '../utility'

import { languagesSpec } from './languagesSpec'


const Main = cmp(function Main(props: any) {
  const { ctx$ } = props
  const { model } = ctx$

  const { entity, option, build } = model.main.sdk

  Content(`
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


<main class="flex h-screen">

<!-- Sidebar -->
<aside class="w-64 flex flex-col overflow-y-auto bg-opacity-50">
    <section class="p-3 text-2xl font-bold border-b">
        <h1 class="lg-header">${model.Name} SDK</h1>
    </section>

  <nav class="flex-1 p-4 space-y-4">
  <section>
    <button 
    class="sidebar-section cursor-pointer w-full text-left flex items-center justify-between font-semibold hover:bg-gray-800 p-2 rounded-md"
    data-target="#section-intro"
    >
     Introduction
    </button>
  </section>


<section class="group">
  <button class="side-get-start-nav-btn w-full text-left flex items-center justify-between font-semibold hover:bg-gray-800 p-2 rounded-md" data-target="#side-get-start-sect">
    Getting Started
    <span class="indicator">+</span>
  </button>
  <section id="side-get-start-sect" class="hidden pl-4 space-y-2">`)
  each(build, (lg: any) => {
    const spec = languagesSpec[lg.name$]
    Content(`
    <a  class="side-get-start-sect cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-get-start-${spec.name}">${spec.Name}</a>
`)
  })
  Content(`
  </section>
</section>
           `)

  each(entity, (entity: any) => {
    Content(`
<section class="${entity}-group">
  <button class="side-nav-btn w-full text-left flex items-center justify-between font-semibold hover:bg-gray-800 p-2 rounded-md" data-target="#side-sect-${entity.name}">
    ${entity.Name}
    <span class="indicator">+</span>
  </button>
  <section id="side-sect-${entity.name}" class="hidden pl-4 space-y-2">`)
    each(build, (lg: any) => {
      const spec = languagesSpec[lg.name]
      Content(`
    <a  class="sidebar-section cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-${entity.name}-${spec.name}">${spec.Name}</a>
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

<!-- End Sidebar -->


<div class="flex flex-col overflow-y-auto p-4 w-full">
  <h1 class="lg-header text-5xl font-extrabold text-center tracking-wide my-4 p-10 shadow-sm"> ${model.Name} SDK Documentation</h1>

  <div class="w-3/4 mx-auto p-6 rounded-lg shadow-md my-20">
    <section id="section-intro" class="my-10">
      <h2 class="text-3xl font-bold my-4">Introduction</h2>
      <p class="text-lg leading-relaxed">Welcome to the ${model.Name} SDK documentation. This guide will help you integrate and use our SDK effectively.</p>
    <p class="text-lg leading-relaxed mb-4">
      This comprehensive documentation will guide you through the ${model.Name} SDK, designed to simplify integration with our APIs.
      Whether working with multiple languages, you'll find everything you need to
      get started and efficiently manage its business entities.
    </p>
    <p class="text-lg leading-relaxed mb-4">
      The ${model.Name} SDK adopts an entity-oriented approach, mapping business logic directly to your code without the need to 
      handle individual endpoint paths. With this SDK, you can create multiple concurrent client instances, each providing
      intuitive methods for managing and interacting with your business entities.
    </p>
    <p class="text-lg leading-relaxed">
      Browse the sections below to explore how to install, initialize, and use the SDK for each supported language.
    </p>
    </section>
  </div>

  <div class="w-3/4 mx-auto p-6 rounded-lg shadow-md my-20" >
      <h2 class="text-3xl font-bold my-4">Getting Started</h2>`)
  each(build, (lg: any) => {
    const spec = languagesSpec[lg.name$]
    Content(`
    <section id="section-get-start-${spec.name}" class="p-6 rounded-lg my-30">
      <h3 id="${spec.Name}" class="lg-header text-3xl font-bold mb-4">${spec.Name}</h3>

      <section id="${spec.Name}-GettingStarted" class="flex flex-col content-between mb-30 p-1 rounded-lg">
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg">
      <section class="w-1/2">
        <h4 class="font-bold my-4">1. Install SDK</h4>
        <p class="break-words">
        Use the following command to install the SDK for ${spec.Name}. This SDK provides all necessary functions to interact with our APIs easily.
      </p>
      </section>

        <pre class="w-1/2">
        <code class="language-${spec.name}">
  ${spec.install(model)}
        </code>
        </pre>
      </section>

      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg">
      <section class="w-1/2">
      <h4 class="text-1xl font-bold my-4">2. Initialize SDK</h4>
        <p class="break-words">
          The ${model.Name} SDK provides a simple interface to interact with the API, allowing you to easily create client instances for working with different business entities. This is a code snippet to initialize the SDK using environment variables.
        </p>
      </section>

          <pre class="w-1/2">
          <code class="language-${spec.name}">`)
    spec.init(model, option)
    Content(`
          </code>
          </pre>
          </section>
        </section>
  </section>`)
  })
  Content(`
</div>


<div class="w-3/4 mx-auto p-6 shadow-md">
      <h2 class="text-3xl font-bold my-4">Entities</h2>
         `)

  each(entity, (entity: any) => {
    Content(`
  <section id="${entity.Name}" class="p-6 rounded-lg my-30">
    <h2 class="text-3xl font-bold mb-4">${entity.Name}</h2>
    <p class="text-lg leading-relaxed">Details about the ${entity.Name} entity goes here.</p>

           `)
    each(build, (lg: any) => {
      const spec = languagesSpec[lg.name$]
      Content(`
    <section id="section-${entity.name}-${spec.name}" class="p-6 rounded-lg my-30">
      <h1 id="${spec.Name}" class="lg-header text-3xl font-bold mb-4">${spec.Name}</h1>

    <section id="${spec.Name}-Methods" class="my-10 p-1 rounded-lg">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `)

      each(entity.op, (op: any) => {
        if (op.name == "list") {
          Content(`
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description.
      </p>
      </section>
        <pre class="w-1/2">
        <code class="language-${spec.name}">
                  `)
          spec.list(op, entity)
          Content(`
        </code>
        </pre>
      </section>
                  `)
        } else if (op.name == "create") {
          Content(`
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description.
      </p>
      </section>
        <pre class="w-1/2">
        <code class="language-${spec.name}">
                  `)
          spec.create(op, entity)
          Content(`
        </code>
        </pre>
      </section>
                  `)
        } else if (op.name == "save") {
          Content(`
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description.
      </p>
      </section>
        <pre class="w-1/2">
        <code class="language-${spec.name}">
                  `)
          spec.save(op, entity)
          Content(`
        </code>
        </pre>
      </section>
                  `)
        } else {
          Content(`
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description.
      </p>
      </section>
        <pre class="w-1/2">
        <code class="language-${spec.name}">
                  `)
          spec.load(op, entity)
          Content(`
        </code>
        </pre>
      </section>
                  `)
        }
      })
      Content(`
  </section>
  </section>
           `)
    })
    Content(`

  </section>
          `)

  })
  Content(`
  </div>
  </div>
</main>
          `)
})

export {
  Main
}
