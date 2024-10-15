import * as JostracaModule from 'jostraca';
import { Main } from './web/Main';
type DocGenOptions = {
    folder: string;
    fs: any;
    root?: string;
    def?: string;
    model?: {
        folder: string;
        entity: any;
    };
    meta?: {
        name: string;
    };
};
declare const Jostraca: typeof JostracaModule.Jostraca;
declare function DocGen(opts: DocGenOptions): {
    generate: (spec: any) => Promise<void>;
};
declare namespace DocGen {
    var makeBuild: (opts: DocGenOptions) => Promise<(model: any, build: any) => Promise<void>>;
}
export type { DocGenOptions, };
type Component = (props: any, children?: any) => void;
export declare const cmp: (component: Function) => Component;
export declare const names: (base: any, name: string, prop?: string) => any;
export declare const each: (subject?: any, apply?: any) => any;
export declare const snakify: (input: any[] | string) => string;
export declare const camelify: (input: any[] | string) => string;
export declare const kebabify: (input: any[] | string) => string;
export declare const select: (key: any, map: Record<string, Function>) => any;
export declare const cmap: (o: any, p: any) => any;
export declare const vmap: (o: any, p: any) => any;
export declare const get: (root: any, path: string | string[]) => any;
export declare const getx: (root: any, path: string | string[]) => any;
export declare const Project: Component;
export declare const Folder: Component;
export declare const File: Component;
export declare const Content: Component;
export declare const Copy: Component;
export declare const Fragment: Component;
export declare const Inject: Component;
export { Main, Jostraca, DocGen, };
