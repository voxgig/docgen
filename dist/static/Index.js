"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Index = void 0;
const jostraca_1 = require("jostraca");
const Main_1 = require("./Main");
const Index = (0, jostraca_1.cmp)(function Index(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    // console.log('Index', model.test)
    (0, jostraca_1.Folder)({ name: 'static' }, () => {
        (0, jostraca_1.Folder)({ name: 'src' }, () => {
            // TODO: need to be able to resolve fragments from source folder too
            if (!model.test) {
                (0, jostraca_1.Copy)({ from: `${__dirname}/../../src/static/header.html`, exclude: true });
                (0, jostraca_1.Copy)({ from: `${__dirname}/../../src/static/footer.html`, exclude: true });
                (0, jostraca_1.Copy)({ from: `${__dirname}/../../src/static/index.css`, exclude: true });
            }
        });
        (0, jostraca_1.Folder)({ name: 'dist' }, () => {
            (0, jostraca_1.File)({ name: 'index.html' }, () => {
                (0, jostraca_1.Content)(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
`);
                // TODO: need to be able to resolve fragments from source folder too
                if (!model.test) {
                    (0, jostraca_1.Fragment)({ from: `../../src/index.css`, indent: '      ' });
                }
                (0, jostraca_1.Content)(`
    </style>
  </head>
  <body>
   <header>
     <template shadowrootmode="open">
`);
                if (!model.test) {
                    (0, jostraca_1.Fragment)({ from: `../../src/header.html`, indent: '      ' });
                }
                (0, jostraca_1.Content)(`
     </template>
   </header>

   <main class="content space-y-8">
     <template shadowrootmode="open">
`);
                (0, Main_1.Main)({});
                (0, jostraca_1.Content)(`
     </template>
   </main>

   <footer>
     <template shadowrootmode="open">
       <style>
          hr {
            border: 0;
            height: 0.25rem;
            background-image: linear-gradient(to right, var(--c1), var(--c2), var(--c3));
          }
       </style>

`);
                if (!model.test) {
                    (0, jostraca_1.Fragment)({ from: `../../src/footer.html`, indent: '      ' });
                }
                (0, jostraca_1.Content)(`
     </template>
   </footer>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>
   <script>
        document.addEventListener("DOMContentLoaded", () => {
        const mainShadowRoot = document.querySelector("main").shadowRoot;

        const tCssLink = document.createElement('link');
        tCssLink.rel = 'stylesheet';
        tCssLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
        mainShadowRoot.appendChild(tCssLink);

        const prismlink = document.createElement('link');
        prismlink.rel = 'stylesheet';
        prismlink.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
        mainShadowRoot.appendChild(prismlink);

        mainShadowRoot.querySelectorAll("pre code").forEach((block) => Prism.highlightElement(block));

        const prismTooklink = document.createElement('link');
        prismTooklink.rel = 'stylesheet';
        prismTooklink.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css';
        mainShadowRoot.appendChild(prismTooklink);


        mainShadowRoot.querySelectorAll(".side-get-start-sect, .sidebar-section").forEach((el) => {
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
              } else {
                console.error(\`Sidebar target not found: \${targetID}\`);
              }
            });
          });
        
      });
   </script>
  </body>
</html>
`);
            });
        });
    });
});
exports.Index = Index;
//# sourceMappingURL=Index.js.map