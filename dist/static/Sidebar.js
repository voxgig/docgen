"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = void 0;
const jostraca_1 = require("jostraca");
const languagesSpec_1 = require("./languagesSpec");
const Sidebar = (0, jostraca_1.cmp)(function Sidebar(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    const { entity, build } = model.main.sdk;
    (0, jostraca_1.Content)(`
<aside class="w-full md:w-64 p-6 md:p-0 flex flex-col md:sticky md:overflow-y-auto">
    <section class="p-3 text-2xl font-bold border-none md:border-b">
        <h1 class="lg-header hidden md:block">${model.Name} SDK</h1>
    </section>
  <button class="side-get-start-nav-btn text-2xl w-full text-left flex items-center justify-between font-semibold p-2 md:hidden" data-target="#sections-mobile"> 
      Sections
      <span class="indicator">+</span>
  </button>
  <nav id="sections-mobile" class="flex-1 p-4 space-y-4 hidden md:block">
  <section>
    <button 
    class="sidebar-section cursor-pointer w-full text-left flex items-center justify-between font-semibold p-2"
    data-target="#section-intro"
    >
     Introduction
    </button>
  </section>


<section class="group">
  <button class="side-get-start-nav-btn w-full text-left flex items-center justify-between font-semibold p-2" data-target="#side-get-start-sect">
    Getting Started
    <span class="indicator">+</span>
  </button>
  <section id="side-get-start-sect" class="hidden pl-4 space-y-2">`);
    (0, jostraca_1.each)(build, (lg) => {
        const spec = languagesSpec_1.languagesSpec[lg.name$];
        (0, jostraca_1.Content)(`
    <a  class="side-get-start-sect cursor-pointer block p-2" data-target="#section-get-start-${spec.name}">${spec.Name}</a>
`);
    });
    (0, jostraca_1.Content)(`
  </section>
</section>
           `);
    (0, jostraca_1.each)(entity, (entity) => {
        (0, jostraca_1.Content)(`
<section class="${entity}-group">
  <button class="side-nav-btn w-full text-left flex items-center justify-between font-semibold p-2" data-target="#side-sect-${entity.name}">
    ${entity.Name}
    <span class="indicator">+</span>
  </button>
  <section id="side-sect-${entity.name}" class="hidden pl-4 space-y-2">`);
        (0, jostraca_1.each)(build, (lg) => {
            const spec = languagesSpec_1.languagesSpec[lg.name];
            (0, jostraca_1.Content)(`
    <a  class="sidebar-section cursor-pointer block p-2" data-target="#section-${entity.name}-${spec.name}">${spec.Name}</a>
`);
        });
        (0, jostraca_1.Content)(`
  </section>
</section>
          `);
    });
    (0, jostraca_1.Content)(`
  </nav>
</aside>
         `);
});
exports.Sidebar = Sidebar;
//# sourceMappingURL=Sidebar.js.map