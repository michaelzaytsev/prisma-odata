import { ODataBinds, parse } from '@balena/odata-parser';
import { DEFAULT_MAXIMUM_PROPERTY_NAME_CHUNKS } from './defaults';
import { composeProperty } from './utils';

export function convertODataFilterQuery($filter: string, options?: ConvertODataFilterQueryOptions): any {
  const parsedUrl = parse(`/model/$count?$filter=${$filter}`);
  return convertOperation(parsedUrl.tree.options!.$filter, parsedUrl.binds,
    options?.maximumPropertyNameChunks || DEFAULT_MAXIMUM_PROPERTY_NAME_CHUNKS);
}

export interface ConvertODataFilterQueryOptions {
  maximumPropertyNameChunks?: number;
}

function convertOperation(operation: any[], binds: ODataBinds, maximumPropertyNameChunks: number): any {
  const operator = operation[0];
  switch (operator) {
    case 'and':
      return { AND: operation.slice(1).map(suboperation => convertOperation(suboperation, binds, maximumPropertyNameChunks)) };
    case 'or':
      return { OR: operation.slice(1).map(suboperation => convertOperation(suboperation, binds, maximumPropertyNameChunks)) };
    case 'not':
      return { NOT: convertOperation(operation[1], binds, maximumPropertyNameChunks) };
    case 'ne':
      return { NOT: composeProperty(operation[1],
        operation[2] === null ? null : binds[operation[2].bind][1], maximumPropertyNameChunks) };
    case 'eq':
      return composeProperty(operation[1],
        operation[2] === null ? null : binds[operation[2].bind][1], maximumPropertyNameChunks);
    case 'lt': case 'gt':
      return composeProperty(operation[1], { [operator]: binds[operation[2].bind][1] }, maximumPropertyNameChunks);
    case 'le':
      return composeProperty(operation[1], { lte: binds[operation[2].bind][1] }, maximumPropertyNameChunks);
    case 'ge':
      return composeProperty(operation[1], { gte: binds[operation[2].bind][1] }, maximumPropertyNameChunks);
    case 'call':
      const { method, args } = operation[1];
      switch (method) {
        case 'contains':
          return composeProperty(args[0], { contains: binds[args[1].bind][1] }, maximumPropertyNameChunks);
        case 'startswith':
          return composeProperty(args[0], { startsWith: binds[args[1].bind][1] }, maximumPropertyNameChunks);
        case 'endswith':
          return composeProperty(args[0], { endsWith: binds[args[1].bind][1] }, maximumPropertyNameChunks);
        default:
          throw new Error(`Unhandled method "${method}"`);
      }
    default:
      throw new Error(`Unhandled operator "${operator}"`);
  }
}
