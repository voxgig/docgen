"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const jostraca_1 = require("jostraca");
const Main = (0, jostraca_1.cmp)(function Main(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    const { entity, option } = model.main.sdk;
    (0, jostraca_1.Content)(`
<style>
:host {
  /* Colors */
  --c1: #ffffff;
  --c2: #000000;
  --c3: #85ea2d;
}

/* Generic Styles */
html {
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

body {
  background-color: var(--c2);
  color: var(--c1);
}

main,
footer {
  background-color: var(--c2);
  color: var(--c1);
}

main {
  display: flex;
  height: 100vh;
}

h1 {
background: linear-gradient(to right, var(--c3), var(--c1));
background-clip: text;
color: transparent;
}

.sidebar {
  width: 10rem;
  color: var(--c1);
  border-right: 1px solid var(--c3);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
  z-index: 0;
}

.content-section {
  display: block;
}

.content-section:hover {
  cursor: pointer;
  color: var(--c3);
}

pre {
  background-color: var(--c1);
}

.lang-section {
  background-color: rgba(17, 24, 39, var(--tw-bg-opacity));
}
</style>


<main>

<!-- Sidebar -->
<nav class="sidebar">
  <a class="content-section" data-target="introduction">
   <h2>Introduction</h2>
  </a>
         `);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
 <a class="content-section" data-target="${entity.Name}">
  <h2>${entity.Name}</h2>
  </a>

 <a class="content-section" data-target="JavaScript">
  <h3>JavaScript</h3>
 </a>

 <a class="content-section" data-target="JavaScript-GettingStarted">Getting Started</a>
           `);
        (0, jostraca_1.each)(entity.op, (op) => {
            (0, jostraca_1.Content)(`
  <a class="content-section" data-target="JavaScript-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `);
        });
        (0, jostraca_1.Content)(`
 <a class="content-section" data-target="Go">
  <h3>Go</h3>
 </a>
 <a class="content-section" data-target="Go-GettingStarted">Getting Started</a>
           `);
        (0, jostraca_1.each)(entity.op, (op) => {
            (0, jostraca_1.Content)(`
  <a class="content-section" data-target="Go-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `);
        });
        (0, jostraca_1.Content)(`
 <a class="content-section" data-target="Python">
  <h3>Python</h3>
 </a>
 <a class="content-section" data-target="Python-GettingStarted">Getting Started</a>
           `);
        (0, jostraca_1.each)(entity.op, (op) => {
            (0, jostraca_1.Content)(`
  <a class="content-section" data-target="Python-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `);
        });
        (0, jostraca_1.Content)(`
 <a class="content-section" data-target="PHP">
  <h3>PHP</h3>
 </a>
 <a class="content-section" data-target="PHP-GettingStarted">Getting Started</a>
           `);
        (0, jostraca_1.each)(entity.op, (op) => {
            (0, jostraca_1.Content)(`
  <a class="content-section" data-target="PHP-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `);
        });
        (0, jostraca_1.Content)(`
 <a class="content-section" data-target="Ruby">
  <h3>Ruby</h3>
 </a>
 <a class="content-section" data-target="Ruby-GettingStarted">Getting Started</a>
           `);
        (0, jostraca_1.each)(entity.op, (op) => {
            (0, jostraca_1.Content)(`
  <a class="content-section" data-target="Ruby-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `);
        });
    });
    (0, jostraca_1.Content)(`
</nav>

<!-- End Sidebar -->




<div class="flex flex-col overflow-y-auto p-4 w-full">
<h1 class="text-5xl font-extrabold text-center tracking-wide my-4 shadow-sm"> ${model.Name} SDK Documentation</h1>

  <div>
    <section id="introduction" class="w-2/3 mx-auto shadow-sm my-20">
      <h2 class="text-3xl font-bold mb-4">Introduction</h2>
      <p class="text-lg leading-relaxed">Welcome to the ${model.Name} SDK documentation. This guide will help you integrate and use our SDK effectively.</p>
    </section>

         `);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
  <section id="${entity.Name}" class="w-2/3 mx-auto p-6 rounded-lg shadow-md my-20">
    <h2 class="text-3xl font-bold mb-4">${entity.Name}</h2>
    <p class="text-lg leading-relaxed">Details about the Pet entity goes here.</p>

<!-- JavaScript Section -->
    <section id="JavaScript" class="p-6 rounded-lg my-30 lang-section bg-opacity-50">
      <h1 id="JavaScript" class="text-3xl font-bold mb-4">JavaScript</h1>

      <section id="JavaScript-GettingStarted" class="my-10 p-1 rounded-lg lang-section bg-opacity-55">
      <h2 class="text-2xl font-bold my-4">Getting Started</h2>

      <h3 class="font-bold my-4">1. Install SDK:</h3>
      <pre><code class="language-javascript">
  npm install ${model.name}-sdk
      </code></pre>

      <h3 class="text-1xl font-bold my-4">2. Initialize SDK:</h3>
          <pre><code class="language-javascript">
  const client = ${model.Name}SDK.make({`);
        (0, jostraca_1.each)(option, (opt) => {
            if (opt.kind == "String") {
                (0, jostraca_1.Content)(`
    ${opt.name}: process.env.${model.NAME}_${opt.name.toUpperCase()},`);
            }
        });
        (0, jostraca_1.Content)(`
  })
          </code></pre>
        </section>


    <section id="JavaScript-Methods" class="my-10 p-1 rounded-lg lang-section bg-opacity-55">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `);
        (0, jostraca_1.each)(entity.op, (op) => {
            if (op.name == "list") {
                (0, jostraca_1.Content)(`
    <section id="JavaScript-${op.Name}${entity.Name}">
      <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
      <pre><code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}()
  console.log('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "create") {
                (0, jostraca_1.Content)(`
    <section id="JavaScript-${op.Name}${entity.Name}">
      <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
      <pre><code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}({
    baa: "foo",
  })

  console.log('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "save") {
                (0, jostraca_1.Content)(`
    <section id="JavaScript-${op.Name}${entity.Name}">
    <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
      <pre><code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}({
    id: 1,
    baa: "foo",
  })

  console.log('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `);
            }
            else {
                (0, jostraca_1.Content)(`
    <section id="JavaScript-${op.Name}${entity.Name}">
    <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
      <pre><code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}({
    id: 1
  })

  console.log('${entity.Name}', ${entity.name})
      </code></pre>
    </section>


               `);
            }
        });
        (0, jostraca_1.Content)(`
  </section>
  </section>
<!-- End JavaScript Section -->


<!-- Go Section -->

<section id="Go" class="p-6 rounded-lg my-30 lang-section bg-opacity-50">
      <h1 id="GO" class="text-3xl font-bold mb-4">Go</h1>

      <section id="Go-GettingStarted" class="my-10 p-1 rounded-lg lang-section bg-opacity-55">
      <h2 class="text-2xl font-bold mb-4">Getting Started</h2>

      <h3 class="font-bold my-4">1. Install SDK:</h3>
      <pre><code class="language-go">
  go get ${model.name}
      </code></pre>

      <h3 class="text-1xl font-bold my-4">2. Initialize SDK:</h3>
        <pre><code class="language-go">
  options := ${model.name}sdk.Options{`);
        (0, jostraca_1.each)(option, (opt) => {
            if (opt.kind == "String") {
                const capName = opt.name.charAt(0).toUpperCase() + opt.name.substring(1, opt.name.length);
                (0, jostraca_1.Content)(`
    ${capName}: os.Getenv("${model.NAME}_${opt.name.toUpperCase()}"),`);
            }
        });
        (0, jostraca_1.Content)(`
  }
          </code></pre>
        </section>



    <section id="Go-Methods" class="my-10 p-1 rounded-lg lang-section bg-opacity-55">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `);
        (0, jostraca_1.each)(entity.op, (op) => {
            if (op.name == "list") {
                (0, jostraca_1.Content)(`
    <section id="Go-${op.Name}${entity.Name}">
      <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
        <pre><code class="language-go">
  ${entity.name}, err := client.${entity.Name}().${op.Name}()
  if err != nil {
    log.Println("Error running ${entity.name} ${op.Name}:", err)
    return
  }

  log.Printf("${entity.Name} %+v\\n", ${entity.name})
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "create") {
                (0, jostraca_1.Content)(`
    <section id="Go-${op.Name}${entity.Name}">
      <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
        <pre><code class="language-go">
  data := ${entity.Name}Data{
    Baa: "foo"
  }

  ${entity.name}, err := client.${entity.Name}().${op.Name}(data)
  if err != nil {
    fmt.Println("Error running ${entity.Name} ${op.Name}:", err)
    return
  }

  fmt.Printf("${entity.Name} %+v\\n", ${entity.name})
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "save") {
                (0, jostraca_1.Content)(`
    <section id="Go-${op.Name}${entity.Name}">
      <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
        <pre><code class="language-go">
  data := ${entity.Name}Data{
    Id: 1,
    Baa: "foo",
  }

  ${entity.name}, err := client.${entity.Name}().${op.Name}(data)
  if err != nil {
    fmt.Println("Error running ${entity.Name} ${op.Name}:", err)
    return
  }

  fmt.Printf("${entity.Name} %+v\\n", ${entity.name})
      </code></pre>
      </section>
               `);
            }
            else {
                (0, jostraca_1.Content)(`
    <section id="Go-${op.Name}${entity.Name}">
      <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
        <pre><code class="language-go">
  query := Query{
    Id: 1
  }

  ${entity.name}, err := client.${entity.Name}().${op.Name}(query)
  if err != nil {
    fmt.Println("Error running ${entity.Name} ${op.Name}:", err)
    return
  }

  fmt.Printf("${entity.Name} %+v\\n", ${entity.name})
      </code></pre>
    </section>
               `);
            }
        });
        (0, jostraca_1.Content)(`
    </section>
  </section>
<!-- End Go Section -->



<!-- Python Section -->
    <section id="Python" class="p-6 rounded-lg my-30 lang-section bg-opacity-50">
      <h1 id="Python" class="text-3xl font-bold mb-4">Python</h1>

      <section id="Python-GettingStarted" class="my-10 p-1 rounded-lg lang-section bg-opacity-55">
      <h2 class="text-2xl font-bold my-4">Getting Started</h2>

      <h3 class="font-bold my-4">1. Install SDK:</h3>
      <pre><code class="language-python">
  pip3 install ${model.name}_sdk
      </code></pre>

      <h3 class="text-1xl font-bold my-4">2. Initialize SDK:</h3>
          <pre><code class="language-python">
  client = ${model.Name}SDK.make((`);
        (0, jostraca_1.each)(option, (opt) => {
            if (opt.kind == "String") {
                (0, jostraca_1.Content)(`
    ${opt.name}: environ['${model.NAME}_${opt.name.toUpperCase()}'],`);
            }
        });
        (0, jostraca_1.Content)(`
  ))
          </code></pre>
        </section>


    <section id="Python-Methods" class="my-10 p-1 rounded-lg lang-section bg-opacity-55">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `);
        (0, jostraca_1.each)(entity.op, (op) => {
            if (op.name == "list") {
                (0, jostraca_1.Content)(`
    <section id="Python-${op.Name}${entity.Name}">
      <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
      <pre><code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}()
  print('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "create") {
                (0, jostraca_1.Content)(`
    <section id="Python-${op.Name}${entity.Name}">
      <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
      <pre><code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}(Data(
    baa: "foo",
  ))

  print('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "save") {
                (0, jostraca_1.Content)(`
    <section id="Python-${op.Name}${entity.Name}">
    <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
      <pre><code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}(Data(
    id = 1,
    baa = "foo",
  ))

  print('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `);
            }
            else {
                (0, jostraca_1.Content)(`
    <section id="Python-${op.Name}${entity.Name}">
    <h3 class="font-bold my-4">${op.Name} ${entity.Name}:</h3>
      <pre><code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}({
    "id": 1
  })

  print('${entity.Name}', ${entity.name})
      </code></pre>
    </section>


               `);
            }
        });
        (0, jostraca_1.Content)(`
  </section>
  </section>
<!-- End Python Section -->


<!-- PHP Section -->
    <section id="PHP" class="p-6 rounded-lg shadow-md my-10">
      <h1 id="PHP" class="text-3xl font-bold mb-4">PHP</h1>

      <section id="PHP-GettingStarted">
      <h2 class="text-2xl font-bold mb-4">Getting Started</h2>

      <h3 class="font-bold mb-4">1. Install SDK</h3>
      <pre><code class="language-php">
  composer install ${model.name}-sdk
      </code></pre>

      <h3 class="font-bold mb-4">2. Initialize SDK</h3>
          <pre><code class="language-php">
  $client = ${model.Name}SDK([ `);
        (0, jostraca_1.each)(option, (opt) => {
            if (opt.kind == "String") {
                (0, jostraca_1.Content)(`
    '${opt.name}' => getenv('${model.NAME}_${opt.name.toUpperCase()}'),`);
            }
        });
        (0, jostraca_1.Content)(`
  ]);
          </code></pre>
        </section>
    `);
        (0, jostraca_1.each)(entity.op, (op) => {
            if (op.name == "list") {
                (0, jostraca_1.Content)(`
    <section id="PHP-${op.Name}${entity.Name}">
      <h2 class="text-2xl font-bold mb-4">${op.Name} ${entity.Name}</h2>
      <pre><code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}();
  print_r("${entity.Name} " . $${entity.name});
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "create") {
                (0, jostraca_1.Content)(`
    <section id="PHP-${op.Name}${entity.Name}">
      <h2 class="text-2xl font-bold mb-4">${op.Name} ${entity.Name}</h2>
      <pre><code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    'baa' => "foo",
  ]);

  print_r("${entity.Name} " . $${entity.name});
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "save") {
                (0, jostraca_1.Content)(`
    <section id="PHP-${op.Name}${entity.Name}">
    <h2 class="text-2xl font-bold mb-4">${op.Name} ${entity.Name}</h2>
      <pre><code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    'id' => 1,
    'baa' => "foo",
  ]);

  print_r("${entity.Name} " . $${entity.name});
      </code></pre>
      </section>
               `);
            }
            else {
                (0, jostraca_1.Content)(`
    <section id="PHP-${op.Name}${entity.Name}">
      <h2 class="text-2xl font-bold mb-4">${op.Name} ${entity.Name}</h2>
      <pre><code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    "id" => 1
  ]);

  print_r("${entity.Name} " . $${entity.name});
      </code></pre>
    </section>


               `);
            }
        });
        (0, jostraca_1.Content)(`
  </section>
<!-- End PHP Section -->




<!-- Ruby Section -->
<section id="Ruby" class="p-6 rounded-lg shadow-md my-10">
      <h1 id="Ruby" class="text-3xl font-bold mb-4">Ruby</h1>
      <section id="Ruby-GettingStarted">

      <h2 class="text-2xl font-bold mb-4">Getting Started</h2>
      <h3 class="font-bold mb-4">1. Install SDK</h3>
      <pre><code class="language-ruby">
  gem install ${model.name}-sdk
      </code></pre>

      <h3 class="font-bold mb-4">2. Initialize SDK</h3>
        <pre><code class="language-ruby">
  const client = ${model.Name}SDK.new({`);
        (0, jostraca_1.each)(option, (opt) => {
            if (opt.kind == "String") {
                const capName = opt.name.charAt(0).toUpperCase() + opt.name.substring(1, opt.name.length);
                (0, jostraca_1.Content)(`
    ${capName}: ENV['${model.NAME}_${opt.name.toUpperCase()}'],`);
            }
        });
        (0, jostraca_1.Content)(`
  }
          </code></pre>
        </section>
    `);
        (0, jostraca_1.each)(entity.op, (op) => {
            if (op.name == "list") {
                (0, jostraca_1.Content)(`
    <section id="Ruby-${op.Name}${entity.Name}">
      <h2 class="text-2xl font-bold mb-4">${op.Name} ${entity.Name}</h2>
        <pre><code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}()
  puts "${entity.Name} #{${entity.name}}"
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "create") {
                (0, jostraca_1.Content)(`
    <section id="Ruby-${op.Name}${entity.Name}">
      <h2 class="text-2xl font-bold mb-4">${op.Name} ${entity.Name}</h2>
        <pre><code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}({
    baa: "foo"
  })

  puts "${entity.Name} #{${entity.name}}"
      </code></pre>
      </section>
               `);
            }
            else if (op.name == "save") {
                (0, jostraca_1.Content)(`
    <section id="Ruby-${op.Name}${entity.Name}">
    <h2 class="text-2xl font-bold mb-4">${op.Name} ${entity.Name}</h2>
        <pre><code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}({
    id: 1,
    baa: "foo",
  })

  puts "${entity.Name} #{${entity.name}}"
      </code></pre>
      </section>
               `);
            }
            else {
                (0, jostraca_1.Content)(`
    <section id="Ruby-${op.Name}${entity.Name}">
      <h2 class="text-2xl font-bold mb-4">${op.Name} ${entity.Name}</h2>
        <pre><code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}({
    id: 1
  })

  puts "${entity.Name} #{${entity.name}}"
      </code></pre>
    </section>
               `);
            }
        });
    });
    (0, jostraca_1.Content)(`
  </section>
<!-- End Ruby Section -->

  </section>
  </div>
  </div>
</main>

          `);
});
exports.Main = Main;
//# sourceMappingURL=Main.js.map