import { parseODataFilter } from '.';
import each from 'jest-each';

describe('parseODataFilter', () => {
  test('and', () => {
    expect(parseODataFilter('property lt 12 and model/property gt 7')).toStrictEqual({
      AND: [
        { property: { lt: 12 }},
        { model: { property: { gt: 7 }}},
      ],
    });
  });

  test('or', () => {
    expect(parseODataFilter('property lt 12 or model/property gt 7')).toStrictEqual({
      OR: [
        { property: { lt: 12 }},
        { model: { property: { gt: 7 }}},
      ],
    });
  });

  test('ne', () => {
    expect(parseODataFilter(`property ne null`)).toStrictEqual({ NOT: { property: null }});
  });

  test('ne and ne for the same property', () => {
    expect(parseODataFilter(`property ne null and property ne 'null'`)).toStrictEqual({
      AND: [
        { NOT: { property: null }},
        { NOT: { property: 'null' }},
      ],
    });
  });

  test('eq', () => {
    expect(parseODataFilter(`property eq 12`)).toStrictEqual({ property: 12 });
  });

  each([
    ['lt', 'lt'],
    ['gt', 'gt'],
    ['le', 'lte'],
    ['ge', 'gte'],
  ])
    .test('%s', (odataOperator, prismaOperator) => {
      expect(parseODataFilter(`property ${odataOperator} 12`)).toStrictEqual({ property: { [prismaOperator]: 12 }});
    });

  each([
    ['contains', 'contains'],
    ['startswith', 'startsWith'],
    ['endswith', 'endsWith'],
  ])
    .test('%s', (odataMethod, prismaMethod) => {
      expect(parseODataFilter(`${odataMethod}(property, 'substring')`))
        .toStrictEqual({ property: { [prismaMethod]: 'substring' }});
    });

  test('not contains', () => {
    expect(parseODataFilter(`not contains(property, 'substring')`))
      .toStrictEqual({ NOT: { property: { contains: 'substring' }}});
  });

  test('not contains or not contains for the same property', () => {
    expect(parseODataFilter(`not contains(property, 'substring1') or not contains(property, 'substring2')`))
      .toStrictEqual({
        OR: [
          { NOT: { property: { contains: 'substring1' }}},
          { NOT: { property: { contains: 'substring2' }}},
        ],
      });
  });
});
