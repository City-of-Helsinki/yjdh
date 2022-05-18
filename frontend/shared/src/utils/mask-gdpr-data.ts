import cloneDeep from 'lodash/cloneDeep';
import { isRecord } from 'shared/utils/object.utils';
import { isString } from 'shared/utils/type-guards';
/**
 * Functionality loosely based on https://github.com/rluque8/nested-mask-attributes + added check for finnish ssn
 */

const maskFinnishSsn = (text: unknown): unknown =>
  isString(text)
    ? text.replace(/\d{6}[+Aa-]\d{3}[\dA-z]/g, '*'.repeat(11))
    : text;

/* Gets the length of the given variable */
const getLengthOfAttribute = (attrValue: unknown): number =>
  Array.isArray(attrValue)
    ? attrValue.length
    : (attrValue as string).toString().length;

/* Executes the action indicated in the options,
by default the action is to hide */
const executeAction = (
  object: Record<string, unknown>,
  attrPath: string
): void => {
  const length = getLengthOfAttribute(object[attrPath]);
  // eslint-disable-next-line no-param-reassign
  object[attrPath] = '*'.repeat(length);
};

const recursiveMask = (
  object: Record<string, unknown>,
  attributes: string[]
): void => {
  Object.keys(object).forEach((key) => {
    // Apply recursivity in child key
    if (isRecord(object[key]) || Array.isArray(object[key])) {
      recursiveMask(object[key] as Record<string, unknown>, attributes);
    } else if (attributes.includes(key)) {
      executeAction(object, key);
    }
    // eslint-disable-next-line no-param-reassign
    object[key] = maskFinnishSsn(object[key]);
  });
};

export const maskAttribute = (
  object: Record<string, unknown>,
  attributes: string[]
): typeof object => {
  const clonedObject = cloneDeep(object);
  recursiveMask(clonedObject, attributes);
  return clonedObject;
};

export const ATTRIBUTES_TO_MASK = [
  'contact_person_name',
  'contact_person_email',
  'contact_person_phone_number',
  'street_address',
  'bank_account_number',
  'invoicer_email',
  'invoicer_name',
  'invoicer_phone_number',
  'last_name',
  'social_security_number',
  'email',
  'phone_number',
  'employee_name',
  'employee_ssn',
  'employee_phone_number',
];

const maskGDPRData = <O>(obj: O): Partial<O> => {
  if (isRecord(obj)) {
    return maskAttribute(obj, ATTRIBUTES_TO_MASK) as Partial<O>;
  }
  return maskFinnishSsn(obj) as O;
};

export default maskGDPRData;
