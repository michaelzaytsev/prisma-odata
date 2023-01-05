import { parseODataFilter } from '.';

describe('parseODataFilter', () => {
  test('and', () => {
    expect(parseODataFilter('property lt 12 and model/property gt 7')).toStrictEqual({
      property: { lt: 12 },
      model: { property: { gt: 7 }},
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

  test('not', () => {
    expect(parseODataFilter(`property1 ne null and property2 ne 'null'`)).toStrictEqual({
      NOT: {
        property1: null,
        property2: 'null',
      },
    });
  });

  test('eq', () => {
    expect(parseODataFilter(`property1 eq null and property2 eq 'null'`))
      .toStrictEqual({ property1: null, property2: 'null' });
  });
});
