type Result = {
    status: number | null;
    stdout: string;
    stderr: string;
    error?: Error;
};
type Run = (args: string[], root: string) => Result;
export declare function setupGitHubPages(root: string, options?: {
    dryrun?: boolean;
    check?: boolean;
}, run?: Run): {
    repository: any;
    operation: string;
    configured: boolean;
    url: any;
    branch: any;
    edition: string;
    dryrun: boolean;
    check: boolean;
};
export declare function main(args?: string[]): number;
export {};
