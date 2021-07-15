import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';

export const toCamelKeys = (
  obj: Record<string, unknown>
): Record<string, unknown> => {
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

export const toSnakeKeys = (
  obj: Record<string, unknown>
): Record<string, unknown> => {
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
