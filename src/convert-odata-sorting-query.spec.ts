import { convertODataSortingQuery } from './convert-odata-sorting-query';

describe('convertODataSortingQuery', () => {
  test('single property', () => {
    expect(convertODataSortingQuery('model/property')).toStrictEqual([{ model: { property: 'desc' }}]);
  });

  test('several properties', () => {
    expect(convertODataSortingQuery('property asc,model/property desc'))
      .toStrictEqual([{ property: 'asc' }, { model: { property: 'desc' }}]);
  });
});
