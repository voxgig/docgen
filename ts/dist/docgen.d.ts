export type GenerateOptions = {
    folder: string;
    model: any;
    fs?: any;
    log?: any;
    control?: {
        dryrun?: boolean;
    };
    existing?: any;
    [key: string]: any;
};
export type EditionResult = {
    files: Record<string, string | Buffer>;
    qa: string[];
};
export type EditionProps = {
    model: any;
    edition: any;
    root: string;
    fs: any;
};
export declare function relativePath(value: string): string;
export declare function styleFor(model: any, edition: any): any;
export declare function repoInfo(model: any): {
    url: string;
    path: string;
};
export declare function renderEdition(props: EditionProps): EditionResult;
export declare function generate(opts: GenerateOptions): Promise<{
    editions: any[];
    files: string[];
}>;
export { view, summary, pages, slides } from './content';
export { checkText, proseText, runQA } from './qa';
export declare function stageSite(root: string, name: string): string;
export declare function scaffoldDefaults(): Record<string, string>;
export declare function prepareProject(root: string): void;
