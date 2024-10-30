
import { cmp, each, File, Folder, Content, Fragment } from 'jostraca'

import { resolvePath } from '../utility'


const Main = cmp(function Main(props: any) {
  const { ctx$ } = props
  const { model } = ctx$

  const { entity, option } = model.main.sdk

  const languagesMap = {
    js: {
      Name: "JavaScript",
      name: "javascript",
      install: `npm install ${model.name}-sdk`,
      init: () => {
        const exHeader = `const client = ${model.Name}SDK.make({`

        let exOpts: string[] = []
        each(option, (opt: any) => {
          if (opt.kind == "String") {
            exOpts.push(`${opt.name}: process.env.${model.NAME}_${opt.name.toUpperCase()}`)
          }
        })

        const exFooter = "})"

        return {
          exHeader,
          exContent: exOpts.join(",  "),
          exFooter
        }
      }
    }

  }

  Content(`
<style>
:host {
  /* Colors */
  --c1: #ffffff;
  --c2: #000000;
  --c3: #85ea2d;
}

main {
  background-color: var(--c2);
  color: var(--c1);
}

.lg-header {
  background: linear-gradient(to right, var(--c3), var(--c1));
  background-clip: text;
  color: transparent;
}


.lang-section {
  background-color: rgba(17, 24, 39, var(--tw-bg-opacity));
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
<aside class="w-64 flex flex-col lang-section bg-opacity-50">
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
  <section id="side-get-start-sect" class="hidden pl-4 space-y-2">
    <a  class="side-get-start-sect cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-get-start-javascript">JavaScript</a>
    <a  class="side-get-start-sect cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-get-start-go">Go</a>
    <a  class="side-get-start-sect cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-get-start-python">Python</a>
    <a  class="side-get-start-sect cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-get-start-php">PHP</a>
    <a  class="side-get-start-sect cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-get-start-ruby">Ruby</a>
  </section>
</section>
           `)

  each(entity, (entity: any) => {
    Content(`
<section class="group">
  <button class="side-nav-btn w-full text-left flex items-center justify-between font-semibold hover:bg-gray-800 p-2 rounded-md" data-target="#side-sect">
    ${entity.Name}
    <span class="indicator">+</span>
  </button>
  <section id="side-sect" class="hidden pl-4 space-y-2">
    <a  class="sidebar-section cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-javascript">JavaScript</a>
    <a  class="sidebar-section cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-go">Go</a>
    <a  class="sidebar-section cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-python">Python</a>
    <a  class="sidebar-section cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-php">PHP</a>
    <a  class="sidebar-section cursor-pointer block hover:bg-gray-800 p-2 rounded-md" data-target="#section-ruby">Ruby</a>
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
      Whether you're working with <strong>JavaScript, Go, Python, PHP, or Ruby</strong>, you'll find everything you need to
      get started and efficiently manage its business entities.
    </p>
    <p class="text-lg leading-relaxed mb-4">
      The ${model.Name} SDK adopts an entity-oriented approach, mapping business logic directly to your code, without the need to 
      handle individual endpoint paths. With this SDK, you can create multiple concurrent client instances, each providing
      intuitive methods for managing and interacting with your business entities.
    </p>
    <p class="text-lg leading-relaxed">
      Browse the sections below to explore how to install, initialize, and use the SDK for each supported language.
    </p>
    </section>
  </div>

  <div class="w-3/4 mx-auto p-6 rounded-lg shadow-md my-20" >
      <h2 class="text-3xl font-bold my-4">Getting Started</h2>

<!-- JavaScript Section -->
    <section id="section-get-start-javascript" class="p-6 rounded-lg my-30 lang-section">
      <h3 id="JavaScript" class="lg-header text-3xl font-bold mb-4">JavaScript</h3>

      <section id="JavaScript-GettingStarted" class="flex flex-col content-between mb-30 p-1 rounded-lg lang-section">
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">1. Install SDK</h4>
        <p class="break-words">
        Use the following command to install the SDK for JavaScript. This SDK provides all necessary functions to interact with our APIs easily.
      </p>
      </section>

        <pre class="w-1/2">
        <code class="language-javascript">
  npm install ${model.name}-sdk
        </code>
        </pre>
      </section>

      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
      <h4 class="text-1xl font-bold my-4">2. Initialize SDK</h4>
        <p class="break-words">
          The ${model.Name} SDK provides a simple interface to interact with the API, allowing you to easily create client instances for working with different business entities. This is a code snippet to initialize the SDK using environment variables.
        </p>
      </section>

          <pre class="w-1/2">
          <code class="language-javascript">
  const client = ${model.Name}SDK.make({`)
  each(option, (opt: any) => {
    if (opt.kind == "String") {
      Content(`
    ${opt.name}: process.env.${model.NAME}_${opt.name.toUpperCase()},`)
    }
  })
  Content(`
  })
          </code>
          </pre>
          </section>
        </section>
  </section>
<!-- End JavaScript Section -->



<!-- Go Section -->
    <section id="section-get-start-go" class="p-6 rounded-lg my-30 lang-section">
      <h3 id="Go" class="lg-header text-3xl font-bold mb-4">Go</h3>

      <section id="Go-GettingStarted" class="flex flex-col content-between mb-30 p-1 rounded-lg lang-section">
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">1. Install SDK</h4>
        <p class="break-words">
        Use the following command to install the SDK for Go. This SDK provides all necessary functions to interact with our APIs easily.
      </p>
      </section>

        <pre class="w-1/2">
        <code class="language-go">
  go get ${model.name}
        </code>
        </pre>
      </section>

      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
      <h4 class="text-1xl font-bold my-4">2. Initialize SDK</h4>
        <p class="break-words">
          The ${model.Name} SDK provides a simple interface to interact with the API, allowing you to easily create client instances for working with different business entities. This is a code snippet to initialize the SDK using environment variables.
        </p>
      </section>

          <pre class="w-1/2">
          <code class="language-go">
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
          </code>
          </pre>
          </section>
        </section>
  </section>
<!-- End Go Section -->


<!-- Python Section -->
    <section id="section-get-start-python" class="p-6 rounded-lg my-30 lang-section">
      <h3 id="Python" class="lg-header text-3xl font-bold mb-4">Python</h3>

      <section id="Python-GettingStarted" class="flex flex-col content-between mb-30 p-1 rounded-lg lang-section">
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">1. Install SDK</h4>
        <p class="break-words">
        Use the following command to install the SDK for Python. This SDK provides all necessary functions to interact with our APIs easily.
      </p>
      </section>

        <pre class="w-1/2">
        <code class="language-python">
  pip3 install ${model.name}_sdk
        </code>
        </pre>
      </section>

      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
      <h4 class="text-1xl font-bold my-4">2. Initialize SDK</h4>
        <p class="break-words">
          The ${model.Name} SDK provides a simple interface to interact with the API, allowing you to easily create client instances for working with different business entities. This is a code snippet to initialize the SDK using environment variables.
        </p>
      </section>

          <pre class="w-1/2">
          <code class="language-python">
  client = ${model.Name}SDK.make((`)
  each(option, (opt: any) => {
    if (opt.kind == "String") {
      Content(`
    ${opt.name}: environ['${model.NAME}_${opt.name.toUpperCase()}'],`)
    }
  })
  Content(`
  ))
          </code>
          </pre>
          </section>
        </section>
  </section>
<!-- End Python Section -->


<!-- PHP Section -->
    <section id="section-get-start-php" class="p-6 rounded-lg my-30 lang-section">
      <h3 id="PHP" class="lg-header text-3xl font-bold mb-4">PHP</h3>

      <section id="PHP-GettingStarted" class="flex flex-col content-between mb-30 p-1 rounded-lg lang-section">
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">1. Install SDK</h4>
        <p class="break-words">
        Use the following command to install the SDK for PHP. This SDK provides all necessary functions to interact with our APIs easily.
      </p>
      </section>

        <pre class="w-1/2">
        <code class="language-php">
  composer install ${model.name}-sdk
        </code>
        </pre>
      </section>

      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
      <h4 class="text-1xl font-bold my-4">2. Initialize SDK</h4>
        <p class="break-words">
          The ${model.Name} SDK provides a simple interface to interact with the API, allowing you to easily create client instances for working with different business entities. This is a code snippet to initialize the SDK using environment variables.
        </p>
      </section>

          <pre class="w-1/2">
          <code class="language-php">
  $client = ${model.Name}SDK([ `)
  each(option, (opt: any) => {
    if (opt.kind == "String") {
      Content(`
    '${opt.name}' => getenv('${model.NAME}_${opt.name.toUpperCase()}'),`)
    }
  })
  Content(`
  ]);
          </code>
          </pre>
          </section>
        </section>
  </section>
<!-- End PHP Section -->



<!-- Ruby Section -->
    <section id="section-get-start-ruby" class="p-6 rounded-lg my-30 lang-section">
      <h3 id="Ruby" class="lg-header text-3xl font-bold mb-4">Ruby</h3>

      <section id="Ruby-GettingStarted" class="flex flex-col content-between mb-30 p-1 rounded-lg lang-section">
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">1. Install SDK</h4>
        <p class="break-words">
        Use the following command to install the SDK for Ruby. This SDK provides all necessary functions to interact with our APIs easily.
      </p>
      </section>

        <pre class="w-1/2">
        <code class="language-ruby">
  gem install ${model.name}-sdk
        </code>
        </pre>
      </section>

      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
      <h4 class="text-1xl font-bold my-4">2. Initialize SDK</h4>
        <p class="break-words">
          The ${model.Name} SDK provides a simple interface to interact with the API, allowing you to easily create client instances for working with different business entities. This is a code snippet to initialize the SDK using environment variables.
        </p>
      </section>

          <pre class="w-1/2">
          <code class="language-ruby">
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
          </code>
          </pre>
          </section>
        </section>
  </section>
<!-- End Ruby Section -->


</div>


<div class="w-3/4 mx-auto p-6 shadow-md">
      <h2 class="text-3xl font-bold my-4">Entities</h2>
         `)

  each(entity, (entity: any) => {
    Content(`
  <section id="${entity.Name}" class="p-6 rounded-lg my-30 lang-section">
    <h2 class="text-3xl font-bold mb-4">${entity.Name}</h2>
    <p class="text-lg leading-relaxed">Details about the ${entity.Name} entity goes here.</p>

<!-- JavaScript Section -->
    <section id="section-javascript" class="p-6 rounded-lg my-30 lang-section">
      <h1 id="JavaScript" class="lg-header text-3xl font-bold mb-4">JavaScript</h1>

    <section id="JavaScript-Methods" class="my-10 p-1 rounded-lg">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
      <code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}()
  console.log('${entity.Name}', ${entity.name})
      </code>
      </pre>
    </section>
               `)
      } else if (op.name == "create") {
        Content(`
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
        <pre class="w-1/2">
        <code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}({
    baa: "foo",
  })

  console.log('${entity.Name}', ${entity.name})
        </code>
        </pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
        <pre class="w-1/2">
        <code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}({
    id: 1,
    baa: "foo",
  })

  console.log('${entity.Name}', ${entity.name})
        </code>
        </pre>
      </section>
               `)
      } else {
        Content(`
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
        <pre class="w-1/2">
        <code class="language-javascript">
  ${entity.name} = await client.${entity.Name}().${op.name}({
    id: 1
  })

  console.log('${entity.Name}', ${entity.name})
        </code>
        </pre>
      </section>
               `)
      }
    })
    Content(`
  </section>
  </section>
<!-- End JavaScript Section -->


<!-- Go Section -->

<section id="section-go" class="p-6 rounded-lg my-30">
      <h1 id="GO" class="lg-header text-3xl font-bold mb-4">Go</h1>

    <section id="Go-Methods" class="my-10 p-1 rounded-lg">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
        <code class="language-go">
  ${entity.name}, err := client.${entity.Name}().${op.Name}()
  if err != nil {
    log.Println("Error running ${entity.name} ${op.Name}:", err)
    return
  }

  log.Printf("${entity.Name} %+v\\n", ${entity.name})
      </code>
      </pre>
    </section>
               `)
      } else if (op.name == "create") {
        Content(`
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
        <code class="language-go">
  data := ${entity.Name}Data{
    Baa: "foo"
  }

  ${entity.name}, err := client.${entity.Name}().${op.Name}(data)
  if err != nil {
    fmt.Println("Error running ${entity.Name} ${op.Name}:", err)
    return
  }

  fmt.Printf("${entity.Name} %+v\\n", ${entity.name})
      </code>
      </pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
      <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
        <pre class="w-1/2">
        <code class="language-go">
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
      </code>
      </pre>
      </section>
               `)
      } else {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
        <code class="language-go">
  query := Query{
    Id: 1
  }

  ${entity.name}, err := client.${entity.Name}().${op.Name}(query)
  if err != nil {
    fmt.Println("Error running ${entity.Name} ${op.Name}:", err)
    return
  }

  fmt.Printf("${entity.Name} %+v\\n", ${entity.name})
      </code>
      </pre>
    </section>
               `)
      }
    })
    Content(`
    </section>
  </section>
<!-- End Go Section -->



<!-- Python Section -->
    <section id="section-python" class="p-6 rounded-lg my-30">
      <h1 id="Python" class="lg-header text-3xl font-bold mb-4">Python</h1>

    <section id="Python-Methods" class="my-10 p-1 rounded-lg">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
      <code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}()
  print('${entity.Name}', ${entity.name})
      </code>
      </pre>
      </section>
               `)
      } else if (op.name == "create") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
      <code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}(Data(
    baa: "foo",
  ))

  print('${entity.Name}', ${entity.name})
      </code>
      </pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
      <code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}(Data(
    id = 1,
    baa = "foo",
  ))

  print('${entity.Name}', ${entity.name})
      </code>
      </pre>
      </section>
               `)
      } else {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
      <code class="language-python">
  ${entity.name} = client.${entity.Name}().${op.name}({
    "id": 1
  })

  print('${entity.Name}', ${entity.name})
      </code>
      </pre>
    </section>


               `)
      }
    })
    Content(`
  </section>
  </section>
<!-- End Python Section -->


<!-- PHP Section -->
    <section id="section-php" class="p-6 rounded-lg my-30">
    <h1 id="PHP" class="lg-header text-3xl font-bold mb-4">PHP</h1>

    <section id="PHP-Methods" class="my-10 p-1 rounded-lg">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
      <code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}();
  print_r("${entity.Name} " . $${entity.name});
      </code>
      </pre>
      </section>
               `)
      } else if (op.name == "create") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
      <code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    'baa' => "foo",
  ]);

  print_r("${entity.Name} " . $${entity.name});
      </code>
      </pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
      <code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    'id' => 1,
    'baa' => "foo",
  ]);

  print_r("${entity.Name} " . $${entity.name});
      </code>
      </pre>
      </section>
               `)
      } else {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
      <code class="language-php">
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    "id" => 1
  ]);

  print_r("${entity.Name} " . $${entity.name});
      </code>
      </pre>
    </section>


               `)
      }
    })
    Content(`
  </section>
  </section>
<!-- End PHP Section -->




<!-- Ruby Section -->
<section id="section-ruby" class="p-6 rounded-lg my-30">
      <h1 id="Ruby" class="lg-header text-3xl font-bold mb-4">Ruby</h1>

    <section id="Ruby-Methods" class="my-10 p-1 rounded-lg">
      <h2 class="text-2xl font-bold my-4">Methods</h2>
    `)

    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
        <code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}()
  puts "${entity.Name} #{${entity.name}}"
      </code>
      </pre>
      </section>
               `)
      } else if (op.name == "create") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
        <code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}({
    baa: "foo"
  })

  puts "${entity.Name} #{${entity.name}}"
      </code>
      </pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
        <code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}({
    id: 1,
    baa: "foo",
  })

  puts "${entity.Name} #{${entity.name}}"
      </code>
      </pre>
      </section>
               `)
      } else {
        Content(`
    <section class="flex justify-between gap-8 mb-20 p-2 rounded-lg lang-section">
      <section class="w-1/2">
        <h4 class="font-bold my-4">${op.Name} ${entity.Name}</h4>
        <p class="break-words">
        ${op.Name} options and description
      </p>
      </section>
      <pre class="w-1/2">
        <code class="language-ruby">
  ${entity.name} = client.${entity.Name}.${op.name}({
    id: 1
  })

  puts "${entity.Name} #{${entity.name}}"
      </code>
      </pre>
    </section>
               `)
      }
    })
  })
  Content(`
    </section>
  </section>
<!-- End Ruby Section -->

  </section>

  </div>


  </div>
</main>

          `)

})

export {
  Main
}
