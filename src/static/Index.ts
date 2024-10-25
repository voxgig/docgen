
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

   <main>
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
          height: var(--s1); /* Adjust the height to your preference */
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

        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css';
        mainShadowRoot.appendChild(linkElement);

        mainShadowRoot.querySelectorAll("pre code").forEach((block) => Prism.highlightElement(block));

        if (mainShadowRoot) {
         mainShadowRoot.querySelectorAll(".content-section").forEach((section) => {
            section.addEventListener("click", function () {
              const targetID = this.getAttribute("data-target");
              const targetSection = mainShadowRoot.querySelector(\`#\${targetID}\`);
              if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
              }
            });
          });

          const toggleButton = mainShadowRoot.querySelector(".toggle-button");
          toggleButton.addEventListener("click", () => {
            mainShadowRoot.host.classList.toggle("dark-mode");
            if (mainShadowRoot.host.classList.contains('dark-mode')) {
              toggleButton.classList.remove('light-mode');
              toggleButton.classList.add('dark-mode');
            } else {
              toggleButton.classList.remove('dark-mode');
              toggleButton.classList.add('light-mode');
            }
          });
        }
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
