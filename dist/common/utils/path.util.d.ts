export type PathToken = string | number;
export declare function parsePath(path: string): PathToken[];
export declare function getValueByPath(source: unknown, path: string): any;
export declare function setValueByPath(target: Record<string, any>, path: string, value: any): void;
//# sourceMappingURL=path.util.d.ts.map