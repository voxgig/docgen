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
a {
  color: var(--c3);
}

pre {
  background-color: var(--c1);
  border-radius: var(--s1);
}

code {
  color: var(--c2);
  font-family: var(--ff1);
}

 h1 {
      background: linear-gradient(to right, var(--c1), var(--c3));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
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
      <div>
        <h4>JavaScript</h4>
        <pre><code>
          npm install ${model.name}-sdk
        </code></pre>
      </div>
      <div>
        <h4>Go</h4>
        <pre><code>
          go get ${model.name}
        </code></pre>
      </div>

      <h3>Initialize SDK</h3>
      <div>
        <h4>JavaScript</h4>
          <pre><code>
            const client = ${model.Name}SDK.make({
              `);
    (0, jostraca_1.each)(option, (opt) => {
        if (opt.kind == "String") {
            (0, jostraca_1.Content)(`${opt.name}: process.env.${model.NAME}_${opt.name.toUpperCase()},
              `);
        }
    });
    (0, jostraca_1.Content)(`})
          </code></pre>
        </div>
      <div>
        <h4>Go</h4>
          <pre><code>
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
        </div>
      </section>
    `);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.each)(entity.op, (op) => {
            if (op.name == "list") {
                (0, jostraca_1.Content)(`
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <div>
        <h4>JavaScript</h4>
        <pre><code>
          ${entity.name} = await client.${entity.Name}().${op.name}()
          console.log('${entity.Name}', ${entity.name})
        </code></pre>
      </div>
      <div>
        <h4>Go</h4>
        <pre><code>
          ${entity.name}, err := client.${entity.Name}().${op.Name}()
          if err != nil {
            log.Println("Error running ${entity.name} ${op.Name}:", err)
            return
          }

          log.Printf("${entity.Name} %+v\\n", ${entity.name})
        </code></pre>
      </div>
               `);
            }
            else if (op.name == "create") {
                (0, jostraca_1.Content)(`
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <div>
        <h4>JavaScript</h4>
        <pre><code>
          ${entity.name} = await client.${entity.Name}().${op.name}({
              baa: "foo",
          })

          console.log('${entity.Name}', ${entity.name})
        </code></pre>
      </div>
      <div>
        <h4>Go</h4>
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
      </div>
               `);
            }
            else if (op.name == "save") {
                (0, jostraca_1.Content)(`
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <div>
        <h4>JavaScript</h4>
        <pre><code>
          ${entity.name} = await client.${entity.Name}().${op.name}({
              id: 1,
              baa: "foo",
          })

          console.log('${entity.Name}', ${entity.name})
        </code></pre>
      </div>
      <div>
        <h4>Go</h4>
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
      </div>
               `);
            }
            else {
                (0, jostraca_1.Content)(`
    <section>
      <h2>${op.Name} ${entity.Name}</h2>
      <div>
        <h4>JavaScript</h4>
        <pre><code>
          ${entity.name} = await client.${entity.Name}().${op.name}({
              id: 1
          })
        </code></pre>
      </div>
      <div>
        <h4>Go</h4>
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
      </div>
               `);
            }
        });
    });
});
exports.Main = Main;
//# sourceMappingURL=Main.js.map