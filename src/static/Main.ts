
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
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
}

pre {
  background-color: var(--c1);
  border-radius: var(--s1);
}

code {
  color: var(--c2);
  font-family: var(--ff1);
}

.lang-section {
  color: var(--c3);
}
</style>
<h1> ${model.Name} SDK Documentation</h1>

  <main>
    <section id="introduction">
      <h2>Introduction</h2>
      <p>Welcome to the ${model.Name} SDK documentation. This guide will help you integrate and use our SDK effectively.</p>
    </section>


<!-- JavaScript Section -->

    <section id="JavaScript">
      <h1>JavaScript</h1>

      <h2>Getting Started</h2>

      <h3>1. Install SDK</h3>
      <pre><code>
          npm install ${model.name}-sdk
      </code></pre>

      <h3>2. Initialize SDK</h3>
          <pre><code>
            const client = ${model.Name}SDK.make({
              `)
  each(option, (opt: any) => {
    if (opt.kind == "String") {
      Content(`${opt.name}: process.env.${model.NAME}_${opt.name.toUpperCase()},
              `)
    }
  })
  Content(`})
          </code></pre>
    `)

  each(entity, (entity: any) => {
    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code>
          ${entity.name} = await client.${entity.Name}().${op.name}()
          console.log('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `)
      } else if (op.name == "create") {
        Content(`
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code>
        ${entity.name} = await client.${entity.Name}().${op.name}({
            baa: "foo",
        })

        console.log('${entity.Name}', ${entity.name})
      </code></pre>
      </section>
               `)
      } else if (op.name == "save") {
        Content(`
    <section>
    <h2>${op.Name} ${entity.Name}</h2>
      <pre><code>
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
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code>
        ${entity.name} = await client.${entity.Name}().${op.name}({
            id: 1
        })
      </code></pre>
    </section>


               `)
      }
    })
  })
  Content(`
  </section>


<!-- Go Section -->

<section id="Go">
      <h1>Go</h1>
      <h2>Getting Started</h2>
      <h3 class="steps">1. Install SDK</h3>
      <pre><code>
        go get ${model.name}
      </code></pre>

      <h3 class="steps">2. Initialize SDK</h3>
          <pre><code>
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
    `)

  each(entity, (entity: any) => {
    each(entity.op, (op: any) => {
      if (op.name == "list") {
        Content(`
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code>
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
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code>
        data := ${entity.Name}Data{
          Foo: zed
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
    <section>
    <h2>${op.Name} ${entity.Name}</h2>
      <pre><code>
        data := ${entity.Name}Data{
          Id: 1
          Foo: zed
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
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <pre><code>
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
  })
  Content(`
</main>
          `)
})


export {
  Main
}
