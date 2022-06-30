/*
Get initials from full name
*/
import { isString } from 'shared/utils/type-guards';

export const getInitials = (name: string): string =>
  name
    // eslint-disable-next-line security/detect-unsafe-regex
    .match(/(^\S\S?|\b\S)?/g)
    ?.join('')
    .match(/(^\S|\S$)?/g)
    ?.join('') ?? '';

export const capitalize = (s: string): string =>
  (s && s[0].toUpperCase() + s.slice(1)) || '';

export const phoneToLocal = (phoneNumber?: string): string =>
  phoneNumber?.replace('+358', '0') || '';

export const getBooleanValueFromString = (value?: string): boolean | null => {
  if (value === '') {
    return null;
  }
  if (value === 'false') {
    return false;
  }
  return true;
};

export const isEmpty = (value?: string): boolean =>
  isString(value) ? value?.trim().length === 0 : Boolean(!value);

export const getNumberValue = (s: unknown): number =>
  Number(isString(s) ? s.toString().replace(/,/, '.') : s);

export const stringFloatToFixed = (value: string): string =>
  value.includes(',') ? value.slice(0, value.indexOf(',') + 3) : value;

export const stringToFloatValue = (
  value: string | number | undefined | null
): number => parseFloat(value?.toString().replace(',', '.') || '');

export const formatStringFloatValue = (
  value: number | string | undefined
): string => value?.toString().replace('.', ',') || '';
