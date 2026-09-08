export const getFullName = (
  firstName: string | undefined,
  lastName: string | undefined
): string => [firstName, lastName].join(' ').trim();

export const getFullNameListing = (
  firstName: string | undefined,
  lastName: string | undefined
): string => [lastName, firstName].join(', ').trim();
