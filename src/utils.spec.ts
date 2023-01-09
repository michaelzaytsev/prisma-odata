import { composeProperty } from './utils';

describe('utils', () => {
  describe('composeProperty', () => {
    const property = { name: 'model', property: { name: 'child', property: { name: 'property' }}};

    test('should compose property with several chunks of its name', () => {
      expect(composeProperty(property, 12, 3)).toStrictEqual({ model: { child: { property: 12 }}});
    });

    test('should throw error if maximum of property name chunks is exceeded', () => {
      expect(() => composeProperty(property, 12, 2))
        .toThrowError('Maximum property name chunks is exceeded on chunk "property"');
    });
  });
});
