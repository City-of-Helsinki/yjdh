export const getFirstValue = <T>(value: T[] | T | undefined): T | undefined =>
  Array.isArray(value) ? (value.length > 0 ? value[0] : undefined) : value;
