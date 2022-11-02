import axios from 'axios';

export const isError = (error: unknown): error is Error =>
  Boolean(
    error && typeof error === 'object' && 'stack' in error && 'message' in error
  ) || axios.isAxiosError(error);

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

// https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
export const isDateObject = (object?: unknown): object is Date =>
  Object.prototype.toString.call(object) === '[object Date]';

export type IsoDateString = string;
export const isIsoDateString = (dateStr: unknown): dateStr is IsoDateString => {
  if (
    typeof dateStr !== 'string' ||
    !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(dateStr)
  ) {
    return false;
  }
  try {
    const d = new Date(dateStr);
    return d.toISOString() === dateStr;
  } catch (error: unknown) {
    return false;
  }
};

export const isNonEmptyString = (v: unknown, trim = true): v is string =>
  typeof v === 'string' && (trim ? v.trim() : v).length > 0;

export const isPlainObject = <T = unknown, K extends string | number = string>(
  v: unknown
): v is Record<K, T> =>
  typeof v === 'object' &&
  v !== null &&
  v.constructor === Object &&
  Object.getPrototypeOf(v) === Object.prototype;

export const isSafeInteger = (v: unknown): v is number =>
  typeof v === 'number' && Number.isSafeInteger(v);

export const isParsableNumeric = (v: unknown): v is number | string => {
  if (typeof v === 'number' && !Number.isNaN(v)) {
    return true;
  }
  if (!isNonEmptyString(v)) {
    return false;
  }
  return !Number.isNaN(
    Number.parseInt(v, 10) || Number.isNaN(Number.parseFloat(v))
  );
};

export const isParsableSafeInteger = (v: unknown): v is number | string => {
  const value =
    typeof v === 'string' && /^-?\d+$/.test(v) ? Number.parseInt(v, 10) : v;
  return isSafeInteger(value);
};

export const isHttpStatusCode = (v: unknown): v is number =>
  isSafeInteger(v) && v < 600 && v >= 100;

/**
 * Check whether a variable is not null and not undefined
 */
export function isPresent<T>(v: T): v is NonNullable<T> {
  return v !== undefined && v !== null;
}
