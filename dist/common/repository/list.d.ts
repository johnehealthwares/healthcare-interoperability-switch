import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
type ListQuery = {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
};
export type ListResult<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    meta: any;
};
export declare function executeListQuery<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, alias: string, query: ListQuery): Promise<ListResult<T>>;
export declare function applyFilters(qb: SelectQueryBuilder<any>, alias: string, filters: Record<string, any>): void;
export declare function applyFilter(qb: SelectQueryBuilder<any>, alias: string, field: string, type: string, value?: any, valueTo?: any): void;
export {};
//# sourceMappingURL=list.d.ts.map