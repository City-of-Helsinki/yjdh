/*
Get initials from full name
*/
export const getInitials = (name: string): string =>
  name
    .match(/(^\S\S?|\b\S)?/g)
    ?.join('')
    .match(/(^\S|\S$)?/g)
    ?.join('') ?? '';
