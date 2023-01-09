export function composeProperty(property: any, value: any, maximumPropertyNameChunks: number, level = 0): any {
  if (level === maximumPropertyNameChunks) {
    throw new Error(`Maximum property name chunks is exceeded on chunk "${property.name}"`);
  }
  return {
    [property.name]: property.property
      ? composeProperty(property.property, value, maximumPropertyNameChunks, level + 1)
      : value,
  };
}
