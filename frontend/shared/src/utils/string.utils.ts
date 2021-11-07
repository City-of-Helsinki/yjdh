/*
Get initials from full name
*/
export const getInitials = (name: string): string =>
  name
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
  typeof value === 'string' ? value?.trim().length === 0 : Boolean(!value);

export const getNumberValue = (s: string): number =>
  Number(s?.toString().replace(/,/, '.'));
