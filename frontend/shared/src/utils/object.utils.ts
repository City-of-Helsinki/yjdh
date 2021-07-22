import camelCase from 'lodash/camelCase';
import isArray from 'lodash/isArray';
import snakeCase from 'lodash/snakeCase';

export interface IndexType {
  [key: string]: string;
}

export const toCamelKeys = (obj: IndexType): unknown => {
  if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: toCamelKeys(obj[key]),
      }),
      {}
    );
  }
  if (obj != null && isArray(obj)) {
    return obj.map((i) => toCamelKeys(i));
  }
  return obj;
};

export const toSnakeKeys = (obj: IndexType): unknown => {
  if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeCase(key)]: toSnakeKeys(obj[key]),
      }),
      {}
    );
  }
  if (obj != null && isArray(obj)) {
    return obj.map((i) => toSnakeKeys(i));
  }
  return obj;
};
