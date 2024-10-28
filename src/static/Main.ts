
import { cmp, each, File, Folder, Content, Fragment } from 'jostraca'

import { resolvePath } from '../utility'


const Main = cmp(function Main(props: any) {
  const { ctx$ } = props
  const { model } = ctx$

  const { entity, option } = model.main.sdk

  Content(`
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
  <button class="toggle-button content-section dark-mode">
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
         `)

  each(entity, (entity: any) => {
    Content(`
 <a class="content-section" data-target="${entity.Name}">
  <h2>${entity.Name}</h2>
  </a>

 <a class="content-section" data-target="JavaScript">
  <h3>JavaScript</h3>
 </a>

 <a class="content-section" data-target="JavaScript-GettingStarted">Getting Started</a>
           `)
    each(entity.op, (op: any) => {
      Content(`
  <a class="content-section" data-target="JavaScript-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `)
    })

    Content(`
 <a class="content-section" data-target="Go">
  <h3>Go</h3>
 </a>
 <a class="content-section" data-target="Go-GettingStarted">Getting Started</a>
           `)
    each(entity.op, (op: any) => {
      Content(`
  <a class="content-section" data-target="Go-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `)
    })

    Content(`
 <a class="content-section" data-target="Python">
  <h3>Python</h3>
 </a>
 <a class="content-section" data-target="Python-GettingStarted">Getting Started</a>
           `)
    each(entity.op, (op: any) => {
      Content(`
  <a class="content-section" data-target="Python-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `)
    })

    Content(`
 <a class="content-section" data-target="PHP">
  <h3>PHP</h3>
 </a>
 <a class="content-section" data-target="PHP-GettingStarted">Getting Started</a>
           `)
    each(entity.op, (op: any) => {
      Content(`
  <a class="content-section" data-target="PHP-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `)
    })



    Content(`
 <a class="content-section" data-target="Ruby">
  <h3>Ruby</h3>
 </a>
 <a class="content-section" data-target="Ruby-GettingStarted">Getting Started</a>
           `)
    each(entity.op, (op: any) => {
      Content(`
  <a class="content-section" data-target="Ruby-${op.Name}${entity.Name}">${op.Name} ${entity.Name}</a>
        `)
    })

  })
  Content(`
</nav>

<!-- End Sidebar -->




<div class="content">
<h1> ${model.Name} SDK Documentation</h1>

  <main>
    <section id="introduction">
      <h2>Introduction</h2>
      <p>Welcome to the ${model.Name} SDK documentation. This guide will help you integrate and use our SDK effectively.</p>
    </section>

         `)

  each(entity, (entity: any) => {
    Content(`
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
  const client = ${model.Name}SDK.make({`)
    each(option, (opt: any) => {
      if (opt.kind == "String") {
        Content(`
    ${opt.name}: process.env.${model.NAME}_${opt.name.toUpperCase()},`)
      }
    })
    Content(`
  })
          </code></pre>
        </section>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section id="JavaScript-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}()
  console.log('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `)
      } else if (op.name == "create") {
        Content(`
    <section id="JavaScript-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}({
    baa: "foo",
  })

  console.log('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
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
               `)
      } else {
        Content(`
    <section id="JavaScript-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}({
    id: 1
  })

  console.log('${entity.Name}', ${entity.name})
      </code></pre>
    </section>


               `)
      }
    })
    Content(`
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
  options := ${model.name}sdk.Options{`)
    each(option, (opt: any) => {
      if (opt.kind == "String") {
        const capName = opt.name.charAt(0).toUpperCase() + opt.name.substring(1, opt.name.length);
        Content(`
    ${capName}: os.Getenv("${model.NAME}_${opt.name.toUpperCase()}"),`)
      }
    })
    Content(`
  }
          </code></pre>
        </section>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
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
               `)
      } else if (op.name == "create") {
        Content(`
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
               `)
      } else if (op.name == "save") {
        Content(`
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
               `)
      } else {
        Content(`
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
               `)
      }
    })
    Content(`
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
  client = ${model.Name}SDK.make((`)
    each(option, (opt: any) => {
      if (opt.kind == "String") {
        Content(`
    ${opt.name}: environ['${model.NAME}_${opt.name.toUpperCase()}'],`)
      }
    })
    Content(`
  ))
          </code></pre>
        </section>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section id="Python-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}()
  print('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `)
      } else if (op.name == "create") {
        Content(`
    <section id="Python-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}(Data(
    baa: "foo",
  ))

  print('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
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
               `)
      } else {
        Content(`
    <section id="Python-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}({
    "id": 1
  })

  print('${entity.Name}', ${entity.name})
      </code></pre>
    </section>


               `)
      }
    })
    Content(`
  </section>
<!-- End Python Section -->


<!-- PHP Section -->
    <section id="PHP">
      <h1 id="PHP">PHP</h1>

      <section id="PHP-GettingStarted">
      <h2>Getting Started</h2>

      <h3>1. Install SDK</h3>
      <pre><code class="language-php">
  composer install ${model.name}-sdk
      </code></pre>

      <h3>2. Initialize SDK</h3>
          <pre><code class="language-php">
  $client = ${model.Name}SDK([ `)
    each(option, (opt: any) => {
      if (opt.kind == "String") {
        Content(`
    '${opt.name}' => getenv('${model.NAME}_${opt.name.toUpperCase()}'),`)
      }
    })
    Content(`
  ]);
          </code></pre>
        </section>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section id="PHP-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}();
  print_r("${entity.Name} " . $${entity.name});
      </code></pre>
      </section>
               `)
      } else if (op.name == "create") {
        Content(`
    <section id="PHP-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    'baa' => "foo",
  ]);

  print_r("${entity.Name} " . $${entity.name});
      </code></pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
    <section id="PHP-${op.Name}${entity.Name}">
    <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    'id' => 1,
    'baa' => "foo",
  ]);

  print_r("${entity.Name} " . $${entity.name});
      </code></pre>
      </section>
               `)
      } else {
        Content(`
    <section id="PHP-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    "id" => 1
  ]);

  print_r("${entity.Name} " . $${entity.name});
      </code></pre>
    </section>


               `)
      }
    })
    Content(`
  </section>
<!-- End PHP Section -->




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
  const client = ${model.Name}SDK.new({`)
    each(option, (opt: any) => {
      if (opt.kind == "String") {
        const capName = opt.name.charAt(0).toUpperCase() + opt.name.substring(1, opt.name.length);
        Content(`
    ${capName}: ENV['${model.NAME}_${opt.name.toUpperCase()}'],`)
      }
    })
    Content(`
  }
          </code></pre>
        </section>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section id="Ruby-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
        <pre><code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}()
  puts "${entity.Name} #{${entity.name}}"
      </code></pre>
      </section>
               `)
      } else if (op.name == "create") {
        Content(`
    <section id="Ruby-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
        <pre><code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}({
    baa: "foo"
  })

  puts "${entity.Name} #{${entity.name}}"
      </code></pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
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
               `)
      } else {
        Content(`
    <section id="Ruby-${op.Name}${entity.Name}">
      <h2>${op.Name} ${entity.Name}</h2>
        <pre><code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}({
    id: 1
  })

  puts "${entity.Name} #{${entity.name}}"
      </code></pre>
    </section>
               `)
      }
    })
  })
  Content(`
  </section>
<!-- End Ruby Section -->

  </section>
  </div>
</main>

          `)

})

export {
  Main
}
