
import { cmp, each, File, Folder, Content, Fragment, Copy } from 'jostraca'

import { resolvePath } from '../utility'

import { Main } from './Main'


const Index = cmp(function Index(props: any) {
  const { ctx$ } = props
  const { model } = ctx$

  // console.log('Index', model.test)


  Folder({ name: 'static' }, () => {

    Folder({ name: 'src' }, () => {

      // TODO: need to be able to resolve fragments from source folder too
      if (!model.test) {
        Copy({ from: `${__dirname}/../../src/static/header.html`, exclude: true })
        Copy({ from: `${__dirname}/../../src/static/footer.html`, exclude: true })
        Copy({ from: `${__dirname}/../../src/static/index.css`, exclude: true })
      }
    })


    Folder({ name: 'dist' }, () => {

      File({ name: 'index.html' }, () => {

        Content(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
`)

        // TODO: need to be able to resolve fragments from source folder too
        if (!model.test) {
          Fragment({ from: `../../src/index.css`, indent: '      ' })
        }

        Content(`
    </style>
  </head>
  <body>
   <header>
     <template shadowrootmode="open">
`)

        if (!model.test) {
          Fragment({ from: `../../src/header.html`, indent: '      ' })
        }

        Content(`
     </template>
   </header>

   <main class="content space-y-8">
     <template shadowrootmode="open">
`)

        Main({})

        Content(`
     </template>
   </main>

   <footer>
     <template shadowrootmode="open">
       <style>
          hr {
            border: 0;
            height: var(--s1);
            /* Adjust the height to your preference */
            background-image: linear-gradient(to right, var(--c1), var(--c2), var(--c3));
          }
       </style>

`)

        if (!model.test) {
          Fragment({ from: `../../src/footer.html`, indent: '      ' })
        }

        Content(`
     </template>
   </footer>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
   <script>
        document.addEventListener("DOMContentLoaded", () => {
        const mainShadowRoot = document.querySelector("main").shadowRoot;

        const tailwindLinkEl = document.createElement('link');
        tailwindLinkEl.rel = 'stylesheet';
        tailwindLinkEl.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
        mainShadowRoot.appendChild(tailwindLinkEl);

        const prismlinkEl = document.createElement('link');
        prismlinkEl.rel = 'stylesheet';
        prismlinkEl.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css';
        mainShadowRoot.appendChild(prismlinkEl);

        mainShadowRoot.querySelectorAll("pre code").forEach((block) => Prism.highlightElement(block));

        mainShadowRoot.querySelectorAll(".sidebar-section").forEach((el) => {
          el.addEventListener("click", function () {
            const targetID = this.getAttribute("data-target")
            const targetSection = mainShadowRoot.querySelector(targetID);

            if (targetSection) {
              targetSection.scrollIntoView({ behavior: "smooth" });
            } else {
              console.error(\`Target section not found: \${targetID}\`)
            }
          });
        });

          // Toggle the sidebar visibility of sections
          mainShadowRoot.querySelectorAll(".side-nav-btn").forEach(button => {
            button.addEventListener('click', function () {
              const targetID = this.getAttribute('data-target');
              const target = mainShadowRoot.querySelector(targetID);
              const indicator = this.querySelector(".indicator");
              if (target) {
                if (target.classList.contains('hidden')) {
                  target.classList.remove('hidden');
                  indicator.textContent = '-';
                } else {
                  target.classList.add('hidden');
                  indicator.textContent = '+';
                }
              } else {
                console.error(\`Sidebar target not found: \${targetID}\`);
              }
            });
          });

      });
   </script>
  </body>
</html>
`)

      })
    })

  })
})


export {
  Index
}
