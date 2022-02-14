export const isError = (error: unknown): error is Error =>
  Boolean(
    error && typeof error === 'object' && 'stack' in error && 'message' in error
  );

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

// https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
export const isDateObject = (object?: unknown): object is Date =>
  Object.prototype.toString.call(object) === '[object Date]';
