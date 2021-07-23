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

export const getBooleanValue = (value?: string): boolean => value === 'true';
