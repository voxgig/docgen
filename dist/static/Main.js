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
 @import url('index.css');

 h1 {
  background: linear-gradient(to right, var(--c3), var(--c1));
  background-clip: text;
  color: transparent;
}

.sidebar {
  width: 10rem;
  padding: var(--s4);
  background-color: var(--c2);
  color: var(--c1);
  border-right: 1px solid var(--c3);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
  z-index: 0;
}

.content {
  flex: 1;
  padding: var(--s4);
  overflow-y: auto;
}

.content-section {
  display: block;
  margin-bottom: var(--s2);
  color: var(--c1);
}

.content-section:hover {
  cursor: pointer;
  color: var(--c3);
}

pre {
  background-color: var(--c1);
  border-radius: var(--s1);
  padding: var(--s3);
  margin-bottom: var(--s4)
}

code {
  color: var(--c2);
  font-family: var(--ff1);
}

.lang-section {
  color: var(--c3);
}

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s2);
  margin-bottom: var(--s4);
  background-color: var(--c3);
  color: var(--c2);
  border: none;
  border-radius: var(--s3);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-button:hover {
  background-color: var(--c1);
}

.sun-icon,
.moon-icon {
  display: none;
}

.light-mode .moon-icon {
  display: inline-block;
}

.dark-mode .sun-icon {
  display: inline-block;
}
</style>


<!-- Sidebar -->

<nav class="sidebar">
  <button class="toggle-button content-section light-mode">
    <!-- Moon icon for toggling to dark mode -->
    <svg class="moon-icon" width="30" height="30" id="dark-icon">
      <path fill="currentColor" d="M 23, 5 A 12 12 0 1 0 23, 25 A 12 12 0 0 1 23, 5" />
    </svg>

    <!-- Sun icon for toggling to light mode -->
    <svg class="sun-icon" width="30" height="30" id="light-icon">
      <circle cx="15" cy="15" r="6" fill="currentColor" />
      <line id="ray" stroke="currentColor" stroke-width="2" stroke-linecap="round" x1="15" y1="1" x2="15" y2="4" />
      <use href="#ray" transform="rotate(45 15 15)" />
      <use href="#ray" transform="rotate(90 15 15)" />
      <use href="#ray" transform="rotate(135 15 15)" />
      <use href="#ray" transform="rotate(180 15 15)" />
      <use href="#ray" transform="rotate(225 15 15)" />
      <use href="#ray" transform="rotate(270 15 15)" />
      <use href="#ray" transform="rotate(315 15 15)" />
    </svg>
  </button>

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




<div class="content">
<h1> ${model.Name} SDK Documentation</h1>

  <main>
    <section id="introduction">
      <h2>Introduction</h2>
      <p>Welcome to the ${model.Name} SDK documentation. This guide will help you integrate and use our SDK effectively.</p>
    </section>

         `);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
  <section id="${entity.Name}">
    <h2>${entity.Name}</h2>

<!-- JavaScript Section -->
    <section id="JavaScript">
      <h1 id="JavaScript">JavaScript</h1>

      <section id="JavaScript-GettingStarted">
      <h2>Getting Started</h2>

      <h3>1. Install SDK</h3>
      <pre><code class="language-javascript">
  npm install ${model.name}-sdk
      </code></pre>

      <h3>2. Initialize SDK</h3>
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
    `);
        (0, jostraca_1.each)(entity.op, (op) => {
            if (op.name == "list") {
                (0, jostraca_1.Content)(`
    <section id="JavaScript-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
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
      <h2>${op.Name} ${entity.Name}</h2>
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
    <h2>${op.Name} ${entity.Name}</h2>
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
      <h2>${op.Name} ${entity.Name}</h2>
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
<!-- End JavaScript Section -->


<!-- Go Section -->

<section id="Go">
      <h1 id="GO">Go</h1>
      <section id="Go-GettingStarted">
      <h2>Getting Started</h2>
      <h3 class="steps">1. Install SDK</h3>
      <pre><code class="language-go">
  go get ${model.name}
      </code></pre>

      <h3 class="steps">2. Initialize SDK</h3>
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
    `);
        (0, jostraca_1.each)(entity.op, (op) => {
            if (op.name == "list") {
                (0, jostraca_1.Content)(`
    <section id="Go-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
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
      <h2>${op.Name} ${entity.Name}</h2>
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
    <h2>${op.Name} ${entity.Name}</h2>
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
      <h2>${op.Name} ${entity.Name}</h2>
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
<!-- End Go Section -->



<!-- Python Section -->
    <section id="Python">
      <h1 id="Python">Python</h1>

      <section id="Python-GettingStarted">
      <h2>Getting Started</h2>

      <h3>1. Install SDK</h3>
      <pre><code class="language-python">
  pip3 install ${model.name}_sdk
      </code></pre>

      <h3>2. Initialize SDK</h3>
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
    `);
        (0, jostraca_1.each)(entity.op, (op) => {
            if (op.name == "list") {
                (0, jostraca_1.Content)(`
    <section id="Python-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
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
      <h2>${op.Name} ${entity.Name}</h2>
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
    <h2>${op.Name} ${entity.Name}</h2>
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
      <h2>${op.Name} ${entity.Name}</h2>
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
<!-- End Python Section -->




<!-- Ruby Section -->
<section id="Ruby">
      <h1 id="Ruby">Ruby</h1>
      <section id="Ruby-GettingStarted">
      <h2>Getting Started</h2>
      <h3 class="steps">1. Install SDK</h3>
      <pre><code class="language-ruby">
  gem install ${model.name}-sdk
      </code></pre>

      <h3 class="steps">2. Initialize SDK</h3>
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
      <h2>${op.Name} ${entity.Name}</h2>
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
      <h2>${op.Name} ${entity.Name}</h2>
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
    <h2>${op.Name} ${entity.Name}</h2>
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
      <h2>${op.Name} ${entity.Name}</h2>
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
</main>

          `);
});
exports.Main = Main;
//# sourceMappingURL=Main.js.map