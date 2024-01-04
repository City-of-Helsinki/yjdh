import { VALIDATION_MESSAGE_KEYS } from 'benefit-shared/constants';
import { getNumberValueOrNull } from 'shared/utils/string.utils';
import * as Yup from 'yup';
import { RequiredNumberSchema } from 'yup/lib/number';
import { AnyObject } from 'yup/lib/types';

export const validateNumberField = (
  min: number,
  max: number,
  texts: {
    typeError: string;
    required: string;
  }
): RequiredNumberSchema<number, AnyObject> =>
  Yup.number()
    .transform((_value, originalValue) => getNumberValueOrNull(originalValue))
    .typeError(texts.typeError)
    .nullable()
    .min(min, (param) => ({
      min: param.min,
      key: VALIDATION_MESSAGE_KEYS.NUMBER_MIN,
    }))
    .max(max, (param) => ({
      max: param.max,
      key: VALIDATION_MESSAGE_KEYS.NUMBER_MAX,
    }))
    .required(texts.required);
