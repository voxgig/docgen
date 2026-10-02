export declare function proseText(source: string, format?: string): string;
export declare function authored(source: string, format: string, quoted?: string[]): string;
export declare const valeText: typeof proseText;
export declare function checkText(source: string, format?: string, rejectFile?: string, quoted?: string[]): string[];
export declare function runQA(manifestPath: string, root?: string, vale?: boolean): {
    files: number;
    errors: string[];
};
