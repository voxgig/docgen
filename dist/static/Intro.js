"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intro = void 0;
const jostraca_1 = require("jostraca");
const Intro = (0, jostraca_1.cmp)(function Intro(props) {
    const { ctx$ } = props;
    const { model } = ctx$;
    (0, jostraca_1.Content)(`
<div class="flex flex-col overflow-y-auto p-4 w-full">
  <h1 class="lg-header text-4xl md:text-5xl break-words font-extrabold text-center tracking-wide my-4 p-10"> ${model.Name} SDK Documentation</h1>

  <div class="w-full md:w-3/4 mx-auto p-6 my-20">
    <section id="section-intro" class="my-10">
      <h2 class="text-3xl font-bold my-4">Introduction</h2>
      <p class="text-lg leading-relaxed">Welcome to the ${model.Name} SDK documentation. This guide will help you integrate and use our SDK effectively.</p>
    <p class="text-lg leading-relaxed mb-4">
      This comprehensive documentation will guide you through the ${model.Name} SDK, designed to simplify integration with our APIs.
      Whether working with multiple languages, you'll find everything you need to
      get started and efficiently manage its business entities.
    </p>
    <p class="text-lg leading-relaxed mb-4">
      The ${model.Name} SDK adopts an entity-oriented approach, mapping business logic directly to your code without the need to 
      handle individual endpoint paths. With this SDK, you can create multiple concurrent client instances, each providing
      intuitive methods for managing and interacting with your business entities.
    </p>
    <p class="text-lg leading-relaxed">
      Browse the sections below to explore how to install, initialize, and use the SDK for each supported language.
    </p>
    </section>
  </div>
         `);
});
exports.Intro = Intro;
//# sourceMappingURL=Intro.js.map