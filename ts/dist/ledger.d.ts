export type Ledger = {
    version: number;
    roots: string[];
    files: string[];
};
export type Owned = {
    roots: string[];
    files: string[];
    refused: string[];
};
export type PrunePlan = {
    files: string[];
    folders: string[];
    refused: string[];
};
export declare function isRelativePath(value: unknown): value is string;
export declare function relativePath(value: string): string;
export declare function inside(root: string, rel: string, fs: any): string;
export declare function within(root: string, path: string): boolean;
export declare function ledgerText(roots: string[], files: string[]): string;
export declare function readLedger(fs: any, path: string): Owned;
export declare function prunePlan(fs: any, root: string, previous: Owned, emitted: Set<string>): PrunePlan;
export declare function applyPrune(fs: any, root: string, plan: PrunePlan): void;
