"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entities = void 0;
const jostraca_1 = require("jostraca");
const languagesSpec_1 = require("./languagesSpec");
const Entities = (0, jostraca_1.cmp)(function Entities(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    const { entity, build } = model.main.sdk;
    (0, jostraca_1.Content)(`
<div class="w-full md:w-3/4 mx-auto md:p-6">
  <h2 class="text-3xl font-bold my-4">Entities</h2>`);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
  <section id="${entity.Name}" class="p-6 my-30">
    <h2 class="text-3xl font-bold mb-4">${entity.Name}</h2>
           `);
        (0, jostraca_1.each)(build, (lg) => {
            const spec = languagesSpec_1.languagesSpec[lg.name$];
            (0, jostraca_1.Content)(`
    <section id="section-${entity.name}-${spec.name}" class="my-20 md:p-6">
      <h1 id="${spec.Name}" class="lg-header text-3xl font-bold mb-4">${spec.Name}</h1>

    <section id="${spec.Name}-Methods" class="my-10 p-3">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `);
            (0, jostraca_1.each)(entity.op, (op) => {
                if (op.name == "list") {
                    (0, jostraca_1.Content)(`
      <section class="flex flex-col 2xl:flex-row justify-between gap-8 items-center mb-20 lg:mb-40 lg:p-2">
      <section class="w-full 2xl:w-1/3">
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
      <section class="w-full 2xl:w-2/4">
      <pre class="p-2 rounded-md overflow-x-auto"><code class="language-${spec.name}">`);
                    spec.list(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
      </section>
                  `);
                }
                else if (op.name == "create") {
                    (0, jostraca_1.Content)(`
      <section class="flex flex-col 2xl:flex-row justify-between gap-8 items-center mb-20 lg:mb-40 lg:p-2">
      <section class="w-full 2xl:w-1/3">
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

      <section class="w-full 2xl:w-2/4">
      <pre class="p-2 overflow-x-auto"><code class="language-${spec.name}">`);
                    spec.create(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
      </section>
                  `);
                }
                else if (op.name == "save") {
                    (0, jostraca_1.Content)(`
      <section class="flex flex-col 2xl:flex-row justify-between gap-8 items-center mb-20 lg:mb-40 lg:p-2">
      <section class="w-full 2xl:w-1/3">
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

      <section class="w-full 2xl:w-2/4">
        <pre class="p-2 rounded-md overflow-x-auto"><code class="language-${spec.name}">`);
                    spec.save(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
      </section>
                  `);
                }
                else if (op.name == "remove") {
                    (0, jostraca_1.Content)(`
      <section class="flex flex-col 2xl:flex-row justify-between gap-8 items-center mb-20 lg:mb-40 lg:p-2">
      <section class="w-full 2xl:w-1/3">
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

      <section class="w-full 2xl:w-2/4">
      <pre class="p-2 rounded-md overflow-x-auto"><code class="language-${spec.name}">`);
                    spec.remove(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
      </section>
                  `);
                }
                else {
                    (0, jostraca_1.Content)(`
      <section class="flex flex-col 2xl:flex-row justify-between gap-8 items-center mb-20 lg:mb-40 lg:p-2">
      <section class="w-full 2xl:w-1/3">
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

      <section class="w-full 2xl:w-2/4">
      <pre class="p-2 rounded-md overflow-x-auto"><code class="language-${spec.name}">`);
                    spec.load(op, entity);
                    (0, jostraca_1.Content)(`</code></pre>
      </section>
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
        `);
});
exports.Entities = Entities;
//# sourceMappingURL=Entities.js.map