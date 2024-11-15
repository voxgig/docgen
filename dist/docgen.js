"use strict";
/* Copyright (c) 2024 Richard Rodger, MIT License */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Jostraca = exports.Main = exports.Index = exports.Inject = exports.Fragment = exports.Copy = exports.Content = exports.File = exports.Folder = exports.Project = exports.getx = exports.get = exports.vmap = exports.cmap = exports.select = exports.kebabify = exports.camelify = exports.snakify = exports.each = exports.names = exports.cmp = void 0;
exports.DocGen = DocGen;
const Fs = __importStar(require("node:fs"));
const JostracaModule = __importStar(require("jostraca"));
const Index_1 = require("./static/Index");
Object.defineProperty(exports, "Index", { enumerable: true, get: function () { return Index_1.Index; } });
const Main_1 = require("./static/Main");
Object.defineProperty(exports, "Main", { enumerable: true, get: function () { return Main_1.Main; } });
const prepare_openapi_1 = require("./prepare-openapi");
const { Jostraca } = JostracaModule;
exports.Jostraca = Jostraca;
function DocGen(opts) {
    const fs = opts.fs || Fs;
    const folder = opts.folder || '.';
    // const def = opts.def || 'def.yml'
    const jostraca = Jostraca();
    async function generate(spec) {
        const { model, config } = spec;
        let Root = spec.root;
        if (null == Root) {
            clear(config.root);
            const rootModule = require(config.root);
            Root = rootModule.Root;
        }
        const opts = { fs, folder, meta: { spec } };
        await jostraca.generate(opts, () => Root({ model }));
    }
    async function prepare(spec, ctx) {
        return await (0, prepare_openapi_1.PrepareOpenAPI)(spec, ctx);
    }
    return {
        generate,
    };
}
DocGen.makeBuild = async function (opts) {
    let docgen = undefined;
    const config = {
        root: opts.root,
        def: opts.def || 'no-def',
        kind: 'openapi-3',
        model: opts.model ? (opts.model.folder + '/api.jsonic') : 'no-model',
        meta: opts.meta || {},
        entity: opts.model ? opts.model.entity : undefined,
    };
    return async function build(model, build) {
        if (null == docgen) {
            docgen = DocGen({
                ...opts,
                pino: build.log,
            });
        }
        await docgen.generate({ model, build, config });
    };
};
// Adapted from https://github.com/sindresorhus/import-fresh - Thanks!
function clear(path) {
    let filePath = require.resolve(path);
    if (require.cache[filePath]) {
        const children = require.cache[filePath].children.map(child => child.id);
        // Delete module from cache
        delete require.cache[filePath];
        for (const id of children) {
            clear(id);
        }
    }
    if (require.cache[filePath] && require.cache[filePath].parent) {
        let i = require.cache[filePath].parent.children.length;
        while (i--) {
            if (require.cache[filePath].parent.children[i].id === filePath) {
                require.cache[filePath].parent.children.splice(i, 1);
            }
        }
    }
}
// Prevents TS2742
exports.cmp = JostracaModule.cmp;
exports.names = JostracaModule.names;
exports.each = JostracaModule.each;
exports.snakify = JostracaModule.snakify;
exports.camelify = JostracaModule.camelify;
exports.kebabify = JostracaModule.kebabify;
exports.select = JostracaModule.select;
exports.cmap = JostracaModule.cmap;
exports.vmap = JostracaModule.vmap;
exports.get = JostracaModule.get;
exports.getx = JostracaModule.getx;
exports.Project = JostracaModule.Project;
exports.Folder = JostracaModule.Folder;
exports.File = JostracaModule.File;
exports.Content = JostracaModule.Content;
exports.Copy = JostracaModule.Copy;
exports.Fragment = JostracaModule.Fragment;
exports.Inject = JostracaModule.Inject;
//# sourceMappingURL=docgen.js.map