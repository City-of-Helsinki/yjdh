import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';

export interface IndexType {
  [key: string]: string;
}

export const toCamelKeys = (obj: IndexType): Record<string, unknown> => {
  if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: toCamelKeys(obj[key]),
      }),
      {}
    );
  }
  return obj;
};

export const toSnakeKeys = (obj: IndexType): Record<string, unknown> => {
  if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeCase(key)]: toSnakeKeys(obj[key]),
      }),
      {}
    );
  }
  return obj;
};
