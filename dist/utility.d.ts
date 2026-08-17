declare const resolvePath: (ctx$: any, path: string) => any;
declare const requirePath: (ctx$: any, path: string, flags?: {
    ignore?: boolean;
}) => any;
declare const select: (key: any, map: Record<string, Function>) => any;
export { resolvePath, requirePath, select, };
