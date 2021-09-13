import omitBy from 'lodash/omitBy';

const isNil = <T>(val: T): boolean => val === undefined || val === null;

// eslint-disable-next-line no-secrets/no-secrets
// https://stackoverflow.com/questions/30812765/how-to-remove-undefined-and-null-values-from-an-object-using-lodash

export const filterEmptyValues = <Obj extends Record<string, unknown>>(
  obj: Obj
): Partial<Obj> => omitBy<Obj>(obj, isNil);
