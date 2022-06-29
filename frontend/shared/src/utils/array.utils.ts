export const getFirstValue = <T>(value: T[] | T | undefined): T | undefined =>
  Array.isArray(value) ? (value.length > 0 ? value[0] : undefined) : value;

export const invertBooleanArray = (arr: boolean[]): boolean[] =>
  arr.map((c) => !c);

export const getLastValue = <T>(value: T[] | T | undefined): T | undefined =>
  Array.isArray(value)
    ? value.length > 0
      ? value.slice(-1)[0]
      : undefined
    : value;

export type ArrayType<A> = A extends (infer I)[] ? I : never;

// https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript

export const difference = <T>(arr1: T[], arr2: T[]): T[] =>
  arr1.filter((x) => !arr2.includes(x));

export const intersection = <T>(arr1: T[], arr2: T[]): T[] =>
  arr1.filter((x) => arr2.includes(x));
