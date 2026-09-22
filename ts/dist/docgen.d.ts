import { type PrunePlan } from './ledger';
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
export type GenerateResult = {
    editions: string[];
    files: string[];
    prune: PrunePlan;
};
export type EditionProps = {
    model: any;
    edition: any;
    root: string;
    fs: any;
    resolved?: any;
};
export declare function styleFor(model: any, edition: any): any;
export declare function renderEdition(props: EditionProps): EditionResult;
export declare function generate(opts: GenerateOptions): Promise<GenerateResult>;
export { view, summary, pages, slides } from './content';
export { checkText, proseText, runQA } from './qa';
export { relativePath, readLedger, prunePlan, applyPrune, ledgerText } from './ledger';
export type { Ledger, Owned, PrunePlan } from './ledger';
export declare function stageSite(root: string, name: string): string;
export declare function scaffoldDefaults(): Record<string, string>;
export declare function prepareProject(root: string): void;
