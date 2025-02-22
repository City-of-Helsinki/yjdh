/*
Get initials from full name
*/
import { isString } from 'shared/utils/type-guards';

export const getInitials = (name: string): string => {
  const match = name.match(/(?<=^|\s)(\p{L})/gu);

  if (match) {
    return match.slice(0, 2).join('').toUpperCase();
  }

  return '?';
};

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

export const getNumberValueOrNull = (s: unknown): number | null =>
  !s ? null : getNumberValue(s);

export const stringFloatToFixed = (value: string): string =>
  value.includes(',') ? value.slice(0, value.indexOf(',') + 3) : value;

export const stringToFloatValue = (
  value: string | number | undefined | null
): number => parseFloat(value?.toString().replace(',', '.') || '');

export const formatStringFloatValue = (
  value: number | string | undefined
): string => value?.toString().replace('.', ',') || '';

export const formatFloatToCurrency = (
  value: string | number,
  currency: 'EUR' | null = 'EUR',
  locale = 'fi-FI',
  minimumFractionDigits = 2
): string => {
  let parsedValue: number;
  if (!value || value === '') {
    parsedValue = 0;
  } else if (typeof value === 'string')
    parsedValue = parseFloat(value.toString().replace(',', '.'));
  else {
    parsedValue = value;
  }

  return parsedValue.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
    ...(currency ? { style: 'currency', currency } : {}),
  });
};

export const formatFloatToEvenEuros = (value: string | number): string =>
  formatFloatToCurrency(value, 'EUR', 'fi-FI', 0);
