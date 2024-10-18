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
 @import url('index.css');
a {
  color: var(--c3);
}

pre {
  background-color: var(--c1);
  padding: var(--s1);
  border-radius: var(--s1);
  overflow-x: auto;
}

code {
  color: var(--c2);
  font-family: var(--ff1);
}
</style>
<h1> ${model.Name} SDK Documentation</h1>

<div>
  <main>
    <section id="introduction">
      <h2>Introduction</h2>
      <p>Welcome to the ${model.Name} SDK documentation. This guide will help you integrate and use our SDK effectively.</p>
      <a href="">Template Link</a>
    </section>
    <section id="getting-started">
      <h2>Getting Started</h2>

      <h3>Install SDK</h3>
      <h4>JavaScript</h4>
      <pre><code>
        npm install ${model.name}-sdk
      </code></pre>

      <h3>Initialize SDK</h3>
      <h4>JavaScript</h4>
        <pre><code>
          const client = ${model.Name}SDK.make({
            endpoint: process.env.${model.NAME}_ENDPOINT,
            apikey: process.env.${model.NAME}_APIKEY,
          })
        </code></pre>
      </section>
    `);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
    <section>
      <h2>Create ${entity.Name}</h2>
      <h4>JavaScript</h4>
      <pre><code>
        ${entity.name} = await client.${entity.Name}().create({
          baa: "foo",
        })
      </code></pre>

      <h2>Load ${entity.Name}</h2>
      <h4>JavaScript</h4>
      <pre><code>
        ${entity.name} = await client.${entity.Name}().load({
          id: 1
        })
      </code></pre>

      <h2>List ${entity.Name}</h2>
      <h4>JavaScript</h4>
      <pre><code>
        ${entity.name} = await client.${entity.Name}().List()
      </code></pre>

      <h2>Update ${entity.Name}</h2>
      <h4>JavaScript</h4>
      <pre><code>
        ${entity.name} = await client.${entity.Name}().save({
          baa: "foo",
        })
      </code></pre>

      <h2>Remove ${entity.Name}</h2>
      <h4>JavaScript</h4>
      <pre><code>
        ${entity.name} = await client.${entity.Name}().remove({
          id: 1
        })
      </code></pre>
    </section>
  `);
    });
    (0, jostraca_1.Content)(`
    <section id="examples">
        <h2>Examples</h2>
    </section>
  </main>
</div>
        `);
});
exports.Main = Main;
//# sourceMappingURL=Main.js.map