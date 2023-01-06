import { ODataBinds, parse } from '@balena/odata-parser';

const MAX_PROPERTY_NAME_LEVEL = 7;

export function parseODataFilter($filter: string): ParsedODataQuery {
  const parsedUrl = parse(`/model/$count?$filter=${$filter}`);
  console.log(JSON.stringify(parsedUrl, null, 2));
  return convertOperation(parsedUrl.tree.options!.$filter, parsedUrl.binds);
}

export interface ParsedODataQuery {
  where: any;
}

function convertOperation(operation: any[], binds: ODataBinds): any {
  const operator = operation[0];
  switch (operator) {
    case 'and':
      return { AND: operation.slice(1).map(suboperation => convertOperation(suboperation, binds)) };
    case 'or':
      return { OR: operation.slice(1).map(suboperation => convertOperation(suboperation, binds)) };
    case 'not':
      return { NOT: convertOperation(operation[1], binds) };
    case 'ne':
      return { NOT: composeProperty(operation[1], operation[2] === null ? null : binds[operation[2].bind][1]) };
    case 'eq':
      return composeProperty(operation[1], operation[2] === null ? null : binds[operation[2].bind][1]);
    case 'lt': case 'gt':
      return composeProperty(operation[1], { [operator]: binds[operation[2].bind][1] });
    case 'le':
      return composeProperty(operation[1], { lte: binds[operation[2].bind][1] });
    case 'ge':
      return composeProperty(operation[1], { gte: binds[operation[2].bind][1] });
    case 'call':
      const { method, args } = operation[1];
      switch (method) {
        case 'contains':
          return composeProperty(args[0], { contains: binds[args[1].bind][1] });
        case 'startswith':
          return composeProperty(args[0], { startsWith: binds[args[1].bind][1] });
        case 'endswith':
          return composeProperty(args[0], { endsWith: binds[args[1].bind][1] });
        default:
          throw new Error(`Unhandled method "${method}"`);
      }
    default:
      throw new Error(`Unhandled operator "${operator}"`);
  }
}

function composeProperty(property: any, value: any, level = 0): any {
  if (level === MAX_PROPERTY_NAME_LEVEL) {
    throw new Error(`Maximum nesting level is reached on property name "${property.name}"`);
  }
  return { [property.name]: property.property ? composeProperty(property.property, value, level + 1) : value };
}
