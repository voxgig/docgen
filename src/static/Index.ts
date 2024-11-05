
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>
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
`)

        if (!model.test) {
          Fragment({ from: `../../src/footer.html`, indent: '      ' })
        }

        Content(`
     </template>
   </footer>
   <script>
        document.addEventListener("DOMContentLoaded", () => {
        const mainShadowRoot = document.querySelector("main").shadowRoot;

        mainShadowRoot.querySelectorAll("pre code").forEach((block) => Prism.highlightElement(block));

        mainShadowRoot.querySelectorAll(".side-get-start-sect, .sidebar-section").forEach((el) => {
          el.addEventListener("click", function () {
            const targetID = this.getAttribute("data-target")
            const targetSection = mainShadowRoot.querySelector(targetID);

            if (targetSection) {
              targetSection.scrollIntoView({ behavior: "smooth" });
            } 
          });
        });

        mainShadowRoot.querySelectorAll(".side-nav-btn, .side-get-start-nav-btn").forEach(button => {
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
