export type Page = {
    path: string;
    title: string;
    group: string;
    markdown: string;
};
export declare const html: (v: any) => string;
export declare const prose: (v: any) => string;
export declare const cell: (v: any) => string;
export declare const code: (v: any) => string;
export declare function fence(text: string, language?: string): string;
export declare function rows(map: any): any[];
export declare function repoLinkFor(model: any): {
    url: string;
    path: string;
};
export declare function specLink(model: any): string;
export declare function view(model: any, edition: any): {
    model: any;
    kit: any;
    edition: any;
    entities: any[];
    targets: any[];
    features: any[];
    title: any;
    description: any;
    info: any;
};
export declare function surface(target: any, kit: any): string;
export declare function installation(model: any, target: any): string;
export declare function summary(v: ReturnType<typeof view>): string;
export declare function pages(v: ReturnType<typeof view>, examples?: Record<string, string>): Page[];
export declare function slides(v: ReturnType<typeof view>, example?: string): string;
