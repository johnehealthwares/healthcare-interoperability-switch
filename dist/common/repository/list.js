"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeListQuery = executeListQuery;
exports.applyFilters = applyFilters;
exports.applyFilter = applyFilter;
async function executeListQuery(qb, alias, query) {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
    applyFilters(qb, alias, query.filters || {});
    const [data, total] = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    const pagination = {
        page,
        limit,
        total,
        totalPages,
    };
    return {
        data,
        pagination,
        meta: pagination,
    };
}
function applyFilters(qb, alias, filters) {
    Object.entries(filters).forEach(([field, raw]) => {
        if (!raw)
            return;
        const { type, value, valueTo } = parseFilter(raw);
        applyFilter(qb, alias, field, type, value, valueTo);
    });
}
function parseFilter(raw) {
    const [type, value, valueTo] = raw.split('|');
    return {
        type,
        value,
        valueTo,
    };
}
function resolveField(alias, field) {
    return field.includes('.') ? field : `${alias}.${field}`;
}
function paramName(field, type) {
    return `${field.replace('.', '_')}_${type}_${Date.now()}`;
}
function applyFilter(qb, alias, field, type, value, valueTo) {
    const column = resolveField(alias, field);
    const param = paramName(field, type);
    switch (type) {
        case 'EQUALS':
            qb.andWhere(`${column} = :${param}`, { [param]: value });
            break;
        case 'NOT_EQUALS':
            qb.andWhere(`${column} != :${param}`, { [param]: value });
            break;
        case 'CONTAINS':
        case 'FUZZY_MATCH':
            qb.andWhere(`${column} LIKE :${param}`, {
                [param]: `%${value}%`,
            });
            break;
        case 'GREATER_THAN':
            qb.andWhere(`${column} > :${param}`, { [param]: value });
            break;
        case 'GREATER_THAN_OR_EQUAL':
            qb.andWhere(`${column} >= :${param}`, { [param]: value });
            break;
        case 'LESS_THAN':
            qb.andWhere(`${column} < :${param}`, { [param]: value });
            break;
        case 'LESS_THAN_OR_EQUAL':
            qb.andWhere(`${column} <= :${param}`, { [param]: value });
            break;
        case 'BETWEEN': {
            const from = `${param}_from`;
            const to = `${param}_to`;
            qb.andWhere(`${column} BETWEEN :${from} AND :${to}`, {
                [from]: value,
                [to]: valueTo,
            });
            break;
        }
        case 'MISSING':
            qb.andWhere(`${column} IS NULL`);
            break;
    }
}
//# sourceMappingURL=list.js.map