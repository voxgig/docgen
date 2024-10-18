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
`);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
<section class="mb-8">
  <h2 class="text-2xl font-bold mb-4">${entity.Name}</h2>
</section>
`);
    });
    (0, jostraca_1.Content)(`
      <section id="getting-started" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Getting Started</h2>
          <p>To get started, follow these steps:</p>
          <ol class="list-decimal ml-8 mt-4">
              <li>Install the SDK</li>
              <li>Initialize the SDK</li>
              <li>Start using the SDK</li>
          </ol>
      </section>
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