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
  const operator = operation[0].toLowerCase();
  switch (operator) {
    case 'and':
      return operation.slice(1).reduce((result, suboperation) => {
        const convertedSuboperation = convertOperation(suboperation, binds);
        if (suboperation[0].toLowerCase() === 'ne' && result.NOT) {
          Object.assign(result.NOT, convertedSuboperation.NOT);
          return result;
        } else {
          return Object.assign(result, convertedSuboperation);
        }
      }, {});
    case 'or':
      return { OR: operation.slice(1).map(suboperation => convertOperation(suboperation, binds)) };
    case 'ne':
      return { NOT: composeProperty(operation[1], operation[2] === null ? null : binds[operation[2].bind][1]) };
    case 'eq':
      return composeProperty(operation[1], operation[2] === null ? null : binds[operation[2].bind][1]);
    case 'lt': case 'gt':
      return composeProperty(operation[1], { [operator]: binds[operation[2].bind][1] });
    default:
      throw new Error(`Unhandled operator "${operator.toUpperCase()}"`);
  }
}

function composeProperty(property: any, value: any, level = 0): any {
  if (level === MAX_PROPERTY_NAME_LEVEL) {
    throw new Error(`Maximum nesting level is reached on property name "${property.name}"`);
  }
  return { [property.name]: property.property ? composeProperty(property.property, value, level + 1) : value };
}
