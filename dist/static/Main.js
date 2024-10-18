"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const jostraca_1 = require("jostraca");
const Main = (0, jostraca_1.cmp)(function Main(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    const { entity } = model.main.sdk;
    (0, jostraca_1.Content)(`
<style>
    @import url('https://cdn.tailwindcss.com');
        /* Additional CSS for syntax highlighting */
        pre {
            background-color: #f9f9f9;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
        }
        code {
            color: #333;
            font-family: Menlo, Monaco, 'Courier New', monospace;
        }
</style>

<h1> ${model.Name} SDK Documentation</h1>

<div class="container mx-auto flex flex-col md:flex-row mt-4">
  <aside class="w-full md:w-1/4 bg-green-100 p-4">
      <nav>
          <ul>
              <li class="mb-2"><a href="#introduction" class="text-green-700">Introduction</a></li>
              <li class="mb-2"><a href="#getting-started" class="text-green-700">Getting Started</a></li>
              <li class="mb-2"><a href="#examples" class="text-green-700">Examples</a></li>
          </ul>
      </nav>
  </aside>
<main class="w-full md:w-3/4 bg-white p-4">
      <section id="introduction" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Introduction</h2>
          <p>Welcome to the ${model.Name} SDK documentation. This guide will help you integrate and use our SDK effectively.</p>
      </section>
      <section id="getting-started" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Getting Started</h2>
          <h3>Install SDK</h3>
          <h4>JavaScript</h4>
                    <pre><code class="language-javascript">
npm install ${model.name}-sdk
                        </code></pre>
          <h3>Initialize SDK</h3>
          <h4>JavaScript</h4>
                    <pre><code class="language-javascript">
const client = ${model.Name}SDK.make({
  endpoint: process.env.${model.NAME}_ENDPOINT,
  apikey: process.env.${model.NAME}_APIKEY,
})
                        </code></pre>
      </section>
`);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
<section class="mb-8">
  <h2 class="text-2xl font-bold mb-4">Create ${entity.Name}</h2>
          <h4>JavaScript</h4>
    <pre><code class="language-javascript">
      ${entity.name} = await client.${entity.Name}().create({
        baa: "foo",
      })
  </code></pre>

  <h2 class="text-2xl font-bold mb-4">Load ${entity.Name}</h2>
          <h4>JavaScript</h4>
    <pre><code class="language-javascript">
      ${entity.name} = await client.${entity.Name}().load({
        id: 1
      })
  </code></pre>

  <h2 class="text-2xl font-bold mb-4">List ${entity.Name}</h2>
          <h4>JavaScript</h4>
    <pre><code class="language-javascript">
      ${entity.name} = await client.${entity.Name}().List()
  </code></pre>

  <h2 class="text-2xl font-bold mb-4">Update ${entity.Name}</h2>
          <h4>JavaScript</h4>
    <pre><code class="language-javascript">
      ${entity.name} = await client.${entity.Name}().save({
        baa: "foo",
      })
  </code></pre>

  <h2 class="text-2xl font-bold mb-4">Remove ${entity.Name}</h2>
          <h4>JavaScript</h4>
    <pre><code class="language-javascript">
      ${entity.name} = await client.${entity.Name}().remove({
        id: 1
      })
  </code></pre>
</section>
`);
    });
    (0, jostraca_1.Content)(`
      <section id="examples" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Examples</h2>
          <p>Here are some examples on how to use our SDK:</p>
          <!-- Example code snippets go here -->
      </section>
  </main>
</div>
        `);
});
exports.Main = Main;
//# sourceMappingURL=Main.js.map