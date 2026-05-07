


import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

type ListQuery = {
  page?: number
  limit?: number
  filters?: Record<string, any>
}


export type ListResult<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  meta: any
}

export async function executeListQuery<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  query: ListQuery
): Promise<ListResult<T>> {
  const page = Math.max(Number(query.page || 1), 1)
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100)

  applyFilters(qb, alias, query.filters || {})

  const [data, total] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount()

  const totalPages = Math.ceil(total / limit)

  const pagination = {
    page,
    limit,
    total,
    totalPages,
  }

  return {
    data,
    pagination,
    meta: pagination,
  }
}


export function applyFilters(
  qb: SelectQueryBuilder<any>,
  alias: string,
  filters: Record<string, any>
) {
  Object.entries(filters).forEach(([field, raw]) => {
    if (!raw) return

    const { type, value, valueTo } = parseFilter(raw)
    applyFilter(qb, alias, field, type, value, valueTo)
  })
}

function parseFilter(raw: string) {
  const [type, value, valueTo] = raw.split('|')

  return {
    type,
    value,
    valueTo,
  }
}

function resolveField(alias: string, field: string) {
  return field.includes('.') ? field : `${alias}.${field}`
}

function paramName(field: string, type: string) {
  return `${field.replace('.', '_')}_${type}_${Date.now()}`
}

export function applyFilter(
  qb: SelectQueryBuilder<any>,
  alias: string,
  field: string,
  type: string,
  value?: any,
  valueTo?: any
) {
  const column = resolveField(alias, field)
  const param = paramName(field, type)

  switch (type) {
    case 'EQUALS':
      qb.andWhere(`${column} = :${param}`, { [param]: value })
      break

    case 'NOT_EQUALS':
      qb.andWhere(`${column} != :${param}`, { [param]: value })
      break

    case 'CONTAINS':
    case 'FUZZY_MATCH':
      qb.andWhere(`${column} LIKE :${param}`, {
        [param]: `%${value}%`,
      })
      break

    case 'GREATER_THAN':
      qb.andWhere(`${column} > :${param}`, { [param]: value })
      break

    case 'GREATER_THAN_OR_EQUAL':
      qb.andWhere(`${column} >= :${param}`, { [param]: value })
      break

    case 'LESS_THAN':
      qb.andWhere(`${column} < :${param}`, { [param]: value })
      break

    case 'LESS_THAN_OR_EQUAL':
      qb.andWhere(`${column} <= :${param}`, { [param]: value })
      break

    case 'BETWEEN': {
      const from = `${param}_from`
      const to = `${param}_to`

      qb.andWhere(`${column} BETWEEN :${from} AND :${to}`, {
        [from]: value,
        [to]: valueTo,
      })
      break
    }

    case 'MISSING':
      qb.andWhere(`${column} IS NULL`)
      break
  }
}