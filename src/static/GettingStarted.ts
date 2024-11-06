import { cmp, each, Content } from 'jostraca'

import { languagesSpec } from './languagesSpec'


const GettingStarted = cmp(function GettingStarted(props: any) {
  const { ctx$ } = props
  const { model } = ctx$

  const { option, build } = model.main.sdk

  Content(`
<div class="w-full md:w-3/4 mx-auto p-6 lg:my-20" >
    <h2 class="text-3xl font-bold my-4">Getting Started</h2>`)
  each(build, (lg: any) => {
    const spec = languagesSpec[lg.name$]
    Content(`
  <section id="section-get-start-${spec.name}" class="lg:my-20 lg:p-4">
    <h3 id="${spec.Name}" class="lg-header text-3xl font-bold mb-4">${spec.Name}</h3>

    <section id="${spec.Name}-GettingStarted" class="flex flex-col content-between mb-10 lg:mb-30 lg:p-4">
    <section class="flex flex-col 2xl:flex-row justify-between gap-8 items-center mb-20 lg:mb-40 lg:p-2">
    <section class="w-full 2xl:w-1/3">
      <h4 class="font-bold my-4">1. Install SDK</h4>
      <p class="break-words">
      Use the following command to install the SDK for ${spec.Name}. This SDK provides all necessary functions to interact with our APIs easily.
    </p>
    </section>

    <section class="w-full 2xl:w-2/4">
      <pre class="p-2 rounded-md overflow-x-auto"><code class="language-${spec.name}">${spec.install(model)}</code></pre>
    </section>
    </section>

    <section class="flex flex-col 2xl:flex-row justify-between gap-8 items-center mb-20 lg:mb-40 lg:p-2">
    <section class="w-full 2xl:w-1/3">
    <h4 class="text-1xl font-bold my-4">2. Initialize SDK</h4>
      <p class="break-words">
        The ${model.Name} SDK provides a simple interface to interact with the API, allowing you to easily create client instances for working with different business entities. This is a code snippet to initialize the SDK using environment variables.
      </p>
    </section>


    <section class="w-full 2xl:w-2/4">
      <pre class="p-2 rounded-md overflow-x-auto"><code class="language-${spec.name}">`); spec.init(model, option); Content(`</code></pre>
      </section
        </section>
      </section>
    </section>
  
  </section>
`)
  })
  Content(`
</div>
`)
})


export {
  GettingStarted
}


