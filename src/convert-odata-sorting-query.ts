import { parse } from '@balena/odata-parser';
import { DEFAULT_MAXIMUM_PROPERTY_NAME_CHUNKS } from './defaults';
import { composeProperty } from './utils';

export function convertODataSortingQuery($orderby: string, options?: ConvertODataSortingQuery): any {
  const parsedUrl = parse(`/model/$count?$orderby=${$orderby}`);
  const maximumPropertyNameChunks = options?.maximumPropertyNameChunks || DEFAULT_MAXIMUM_PROPERTY_NAME_CHUNKS;
  return parsedUrl.tree.options!.$orderby!.properties.map(property =>
    composeProperty(property, property.order, maximumPropertyNameChunks));
}

export interface ConvertODataSortingQuery {
  maximumPropertyNameChunks?: number;
};
