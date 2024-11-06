"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const jostraca_1 = require("jostraca");
const Sidebar_1 = require("./Sidebar");
const GettingStarted_1 = require("./GettingStarted");
const Entities_1 = require("./Entities");
const Intro_1 = require("./Intro");
const Main = (0, jostraca_1.cmp)(function Main(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    (0, jostraca_1.Content)(`
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css" rel="stylesheet">

<style>
.lg-header {
  background: linear-gradient(to right, var(--c3), var(--c1));
  background-clip: text;
  color: transparent;
}

.side-get-start-sect:hover {
  color: var(--c3);
}

.sidebar-section:hover {
  color: var(--c3);
}
</style>


<main class="flex flex-col md:flex-row md:h-screen">
`);
    (0, Sidebar_1.Sidebar)({ ctx$ });
    (0, jostraca_1.Content)(`
<div class="flex flex-col overflow-y-auto p-4 w-full">
  <h1 class="lg-header text-4xl md:text-5xl break-words font-extrabold text-center tracking-wide my-4 p-10"> ${model.Name} SDK Documentation</h1>
     `);
    (0, Intro_1.Intro)({ ctx$ });
    (0, GettingStarted_1.GettingStarted)({ ctx$ });
    (0, Entities_1.Entities)({ ctx$ });
    (0, jostraca_1.Content)(`
  </div>
</main>
          `);
});
exports.Main = Main;
//# sourceMappingURL=Main.js.map