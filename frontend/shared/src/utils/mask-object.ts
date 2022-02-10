// eslint-disable-next-line import/no-extraneous-dependencies
import { MaskActions, maskAttribute } from 'nested-mask-attributes';
import { isRecord } from 'shared/utils/object.utils';

export const ATTRIBUTES_TO_MASK = [
  'contact_person_name',
  'contact_person_email',
  'contact_person_phone_number',
  'street_address',
  'employee_name',
  'employee_ssn',
  'employee_phone_number',
  'invoicer_email',
  'invoicer_name',
  'invoicer_phone_number',
  'first_name',
  'last_name',
  'social_security_number',
];

const maskObject = <O>(obj: O): O => {
  if (isRecord(obj)) {
    return maskAttribute(obj, ATTRIBUTES_TO_MASK, {
      action: MaskActions.MASK,
    }) as O;
  }
  return obj;
};

export default maskObject;
