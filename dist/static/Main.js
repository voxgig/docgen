"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const jostraca_1 = require("jostraca");
const languagesSpec_1 = require("./languagesSpec");
const Main = (0, jostraca_1.cmp)(function Main(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    const { entity, option, build } = model.main.sdk;
    (0, jostraca_1.Content)(`
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


<main class="flex h-screen">

<!-- Sidebar -->
<aside class="w-64 flex flex-col overflow-y-auto bg-opacity-50">
    <section class="p-3 text-2xl font-bold border-b">
        <h1 class="lg-header">${model.Name} SDK</h1>
    </section>

  <nav class="flex-1 p-4 space-y-4">
  <section>
    <button 
    class="sidebar-section cursor-pointer w-full text-left flex items-center justify-between font-semibold p-2 rounded-md"
    data-target="#section-intro"
    >
     Introduction
    </button>
  </section>


<section class="group">
  <button class="side-get-start-nav-btn w-full text-left flex items-center justify-between font-semibold p-2 rounded-md" data-target="#side-get-start-sect">
    Getting Started
    <span class="indicator">+</span>
  </button>
  <section id="side-get-start-sect" class="hidden pl-4 space-y-2">`);
    (0, jostraca_1.each)(build, (lg) => {
        const spec = languagesSpec_1.languagesSpec[lg.name$];
        (0, jostraca_1.Content)(`
    <a  class="side-get-start-sect cursor-pointer block p-2 rounded-md" data-target="#section-get-start-${spec.name}">${spec.Name}</a>
`);
    });
    (0, jostraca_1.Content)(`
  </section>
</section>
           `);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
<section class="${entity}-group">
  <button class="side-nav-btn w-full text-left flex items-center justify-between font-semibold p-2 rounded-md" data-target="#side-sect-${entity.name}">
    ${entity.Name}
    <span class="indicator">+</span>
  </button>
  <section id="side-sect-${entity.name}" class="hidden pl-4 space-y-2">`);
        (0, jostraca_1.each)(build, (lg) => {
            const spec = languagesSpec_1.languagesSpec[lg.name];
            (0, jostraca_1.Content)(`
    <a  class="sidebar-section cursor-pointer block p-2 rounded-md" data-target="#section-${entity.name}-${spec.name}">${spec.Name}</a>
`);
        });
        (0, jostraca_1.Content)(`
  </section>
</section>
          `);
    });
    (0, jostraca_1.Content)(`
  </nav>
</aside>

<!-- End Sidebar -->


<div class="flex flex-col overflow-y-auto p-4 w-full">
  <h1 class="lg-header text-5xl font-extrabold text-center tracking-wide my-4 p-10"> ${model.Name} SDK Documentation</h1>

  <div class="w-3/4 mx-auto p-6 rounded-lg shadow-lg my-20">
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

  <div class="w-3/4 mx-auto p-6 rounded-lg my-20" >
      <h2 class="text-3xl font-bold my-4">Getting Started</h2>`);
    (0, jostraca_1.each)(build, (lg) => {
        const spec = languagesSpec_1.languagesSpec[lg.name$];
        (0, jostraca_1.Content)(`
    <section id="section-get-start-${spec.name}" class="my-20 p-6 rounded-lg shadow-lg">
      <h3 id="${spec.Name}" class="lg-header text-3xl font-bold mb-4">${spec.Name}</h3>

      <section id="${spec.Name}-GettingStarted" class="flex flex-col content-between mb-30 p-4 rounded-lg">
      <section class="flex justify-between gap-8 items-center mb-40 p-2 rounded-lg">
      <section class="w-1/3">
        <h4 class="font-bold my-4">1. Install SDK</h4>
        <p class="break-words">
        Use the following command to install the SDK for ${spec.Name}. This SDK provides all necessary functions to interact with our APIs easily.
      </p>
      </section>

      <pre class="p-2 rounded-md"><code class="language-${spec.name}">${spec.install(model)}</code></pre>
      </section>

      <section class="flex justify-between gap-8 items-center my-10 p-2 rounded-lg">
      <section class="w-1/3">
      <h4 class="text-1xl font-bold my-4">2. Initialize SDK</h4>
        <p class="break-words">
          The ${model.Name} SDK provides a simple interface to interact with the API, allowing you to easily create client instances for working with different business entities. This is a code snippet to initialize the SDK using environment variables.
        </p>
      </section>

      <pre class="p-2 rounded-md"><code class="language-${spec.name}">`);
        spec.init(model, option);
        (0, jostraca_1.Content)(`</code></pre>
          </section>
        </section>
  </section>`);
    });
    (0, jostraca_1.Content)(`
</div>


<div class="w-3/4 mx-auto p-6">
      <h2 class="text-3xl font-bold my-4">Entities</h2>
         `);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
  <section id="${entity.Name}" class="p-6 rounded-lg my-30">
    <h2 class="text-3xl font-bold mb-4">${entity.Name}</h2>
           `);
        (0, jostraca_1.each)(build, (lg) => {
            const spec = languagesSpec_1.languagesSpec[lg.name$];
            (0, jostraca_1.Content)(`
    <section id="section-${entity.name}-${spec.name}" class="my-20 p-6 rounded-lg  shadow-lg">
      <h1 id="${spec.Name}" class="lg-header text-3xl font-bold mb-4">${spec.Name}</h1>

    <section id="${spec.Name}-Methods" class="my-10 rounded-lg">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `);
            (0, jostraca_1.each)(entity.op, (op) => {
                if (op.name == "list") {
                    (0, jostraca_1.Content)(`
      <section class="flex justify-between items-center gap-8 my-10 p-2 rounded-lg">
      <section class="w-1/3">
        <h4 class="text-lg font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
          Lists all matching ${entity.Name} entities based on the provided query criteria.
          This method is ideal for retrieving collections of ${entity.Name} entities that meet certain criteria,
          enabling batch operations and bulk data handling.
        </p>
        <h5 class="my-4 font-bold">Parameters:</h5>
        <ul class="list-disc pl-8 space-y-2">
          <li class="font-bold"><strong>query</strong>: 
            <span class="italic">optional</span> - 
            The criteria to filter ${entity.name} entities for listing.
            If omitted, all entities are listed.
          </li>
        </ul>
      <h5 class="my-4 font-bold">Return:</h5>
        <p class="font-bold"><strong>List of ${entity.Name} Entities</strong> -
        A list with one or more ${entity.Name} instances.
      </p>
      </section>
      <pre class="p-2 rounded-md"><code class="language-${spec.name}">`);
                    spec.list(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
                  `);
                }
                else if (op.name == "create") {
                    (0, jostraca_1.Content)(`
      <section class="flex justify-between items-center gap-8 my-10 p-2 rounded-lg">
      <section class="w-1/3">
        <h4 class="text-lg font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
          ${op.Name} an instance of ${entity.name}.
          Returns the created ${entity.name}, 
          allowing easy access and manipulation within your application.
      </p>

      <h5 class="my-4 font-bold">Parameters:</h5>
      <ul class="list-disc pl-8 space-y-2">
        <li class="font-bold"><strong>data</strong>:
          <span class="italic">optional</span> - 
          The data for the new ${entity.name}.</li>
      </ul>
      <h5 class="my-4 font-bold">Return:</h5>
      <p class="font-bold"><strong>${entity.Name}</strong> -
        The created ${entity.Name} instance.
      </p>
      </section>
      <pre class="p-2 rounded-md"><code class="language-${spec.name}">`);
                    spec.create(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
                  `);
                }
                else if (op.name == "save") {
                    (0, jostraca_1.Content)(`
      <section class="flex justify-between items-center gap-8 my-10 p-2 rounded-lg">
      <section class="w-1/3">
        <h4 class="text-lg font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
          It saves an instance of ${entity.Name},
          optionally updating it with new data.
          This method persists the instance's data,
          ensuring updates are stored consistently.
      </p>
      <h5 class="my-4 font-bold">Parameters:</h5>
      <ul class="list-disc pl-8 space-y-2">
        <li class="font-bold"><strong>id</strong>:
          <span class="italic">required</span> - 
          The ${entity.name} identifier to be updated.
        </li>
        <li class="font-bold"><strong>data</strong>:
          <span class="italic">optional</span> - 
          The new ${entity.name} data.
        </li>
      </ul>
      <h5 class="my-4 font-bold">Return:</h5>
      <p class="text-lg"><strong>${entity.Name}</strong> -
        The updated ${entity.Name} instance.
      </p>
      </section>
      <pre class="p-2 rounded-md"><code class="language-${spec.name}">`);
                    spec.save(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
                  `);
                }
                else if (op.name == "remove") {
                    (0, jostraca_1.Content)(`
      <section class="flex justify-between items-center gap-8 my-10 p-2 rounded-lg">
      <section class="w-1/3">
        <h4 class="text-lg font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        <p class="break-words">
          Deletes a matching ${entity.Name} specified by the query parameter.
          This method removes a single ${entity.Name} instance based on the query parameters.
        </p>
        <h5 class="my-4 font-bold">Parameters:</h5>
        <ul class="list-disc pl-8 space-y-2">
          <li class="font-bold"><strong>query</strong>:
            <span class="italic">required</span> - 
            The query criteria for identifying the ${entity.name} to remove.
          </li>
        </ul>
        <h5 class="my-4 font-bold">Return:</h5>
        <p class="font-bold"><strong>N/A</strong>
      </p>
        </p>
      </section>
      <pre class="p-2 rounded-md"><code class="language-${spec.name}">`);
                    spec.remove(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
                  `);
                }
                else {
                    (0, jostraca_1.Content)(`
      <section class="flex justify-between items-center gap-8 my-10 p-2 rounded-lg">
      <section class="w-1/3">
        <h4 class="text-lg font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        <p class="break-words">
        Loads a single, matching ${entity.name}'s data into its instance.
        The query parameter should specify the identifier or criteria for the ${entity.Name} to be retrieved,
        effectively syncing the instance with stored entity data.
        </p>
        <h5 class="my-4 font-bold">Parameters:</h5>
        <ul class="list-disc pl-8 space-y-2">
          <li class="font-bold"><strong>query</strong>:
            <span class="italic">required</span> - 
            The query criteria used to identify and load the ${entity.name} data.
          </li>
        </ul>
        <h5 class="my-4 font-bold">Return:</h5>
        <p class="font-bold"><strong>${entity.Name}</strong> -
        The ${entity.Name} instance.
      </p>
        </p>
      </section>
      <pre class="p-2 rounded-md"><code class="language-${spec.name}">`);
                    spec.load(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
                  `);
                }
            });
            (0, jostraca_1.Content)(`
  </section>
  </section>
           `);
        });
        (0, jostraca_1.Content)(`

  </section>
          `);
    });
    (0, jostraca_1.Content)(`
  </div>
  </div>
</main>
          `);
});
exports.Main = Main;
//# sourceMappingURL=Main.js.map