import { convertODataFilterQuery } from './convert-odata-filter-query';
import each from 'jest-each';

describe('convertODataFilterQuery', () => {
  test('and', () => {
    expect(convertODataFilterQuery('property lt 12 and model/property gt 7')).toStrictEqual({
      AND: [
        { property: { lt: 12 }},
        { model: { property: { gt: 7 }}},
      ],
    });
  });

  test('or', () => {
    expect(convertODataFilterQuery('property lt 12 or model/property gt 7')).toStrictEqual({
      OR: [
        { property: { lt: 12 }},
        { model: { property: { gt: 7 }}},
      ],
    });
  });

  test('ne', () => {
    expect(convertODataFilterQuery(`property ne null`)).toStrictEqual({ NOT: { property: null }});
  });

  test('ne and ne for the same property', () => {
    expect(convertODataFilterQuery(`property ne null and property ne 'null'`)).toStrictEqual({
      AND: [
        { NOT: { property: null }},
        { NOT: { property: 'null' }},
      ],
    });
  });

  test('eq', () => {
    expect(convertODataFilterQuery(`property eq 12`)).toStrictEqual({ property: 12 });
  });

  each([
    ['lt', 'lt'],
    ['gt', 'gt'],
    ['le', 'lte'],
    ['ge', 'gte'],
  ])
    .test('%s', (odataOperator, prismaOperator) => {
      expect(convertODataFilterQuery(`property ${odataOperator} 12`)).toStrictEqual({ property: { [prismaOperator]: 12 }});
    });

  each([
    ['contains', 'contains'],
    ['startswith', 'startsWith'],
    ['endswith', 'endsWith'],
  ])
    .test('%s', (odataMethod, prismaMethod) => {
      expect(convertODataFilterQuery(`${odataMethod}(property, 'substring')`))
        .toStrictEqual({ property: { [prismaMethod]: 'substring' }});
    });

  test('not contains', () => {
    expect(convertODataFilterQuery(`not contains(property, 'substring')`))
      .toStrictEqual({ NOT: { property: { contains: 'substring' }}});
  });

  test('not contains or not contains for the same property', () => {
    expect(convertODataFilterQuery(`not contains(property, 'substring1') or not contains(property, 'substring2')`))
      .toStrictEqual({
        OR: [
          { NOT: { property: { contains: 'substring1' }}},
          { NOT: { property: { contains: 'substring2' }}},
        ],
      });
  });
});
