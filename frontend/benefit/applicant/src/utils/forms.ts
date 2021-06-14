import { getIn } from 'formik';
import { TFunction } from 'next-i18next';

type GenericObject = {
  [field: string]: string;
};

/** Get error text
 * @param {Object} errors
 * @param {Object} touched
 * @param {string} name
 * @param {Function} t
 * @param {boolean} isSubmitted
 * @return {string}
 */
export const getErrorText = (
  errors: GenericObject,
  touched: GenericObject,
  name: string,
  t: TFunction,
  isSubmitted: boolean
): string => {
  const error: GenericObject = getIn(errors, name) as GenericObject;
  return !!error && (getIn(touched, name) || isSubmitted)
    ? typeof error === 'string'
      ? t(error)
      : t(error.key, error)
    : '';
};
