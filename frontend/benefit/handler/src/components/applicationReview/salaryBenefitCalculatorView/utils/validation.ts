import { validateNumberField } from '@frontend/benefit-shared/src/utils/validation';
import {
  CALCULATION_EMPLOYMENT_KEYS,
  EMPLOYEE_KEYS,
  MAX_MONTHLY_PAY,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import { CalculationCommon } from 'benefit-shared/types/application';
import { TFunction } from 'next-i18next';
import * as Yup from 'yup';

export const getValidationSchema = (
  t: TFunction
): Yup.SchemaOf<CalculationCommon> =>
  Yup.object().shape({
    [CALCULATION_EMPLOYMENT_KEYS.START_DATE]: Yup.string()
      .typeError(VALIDATION_MESSAGE_KEYS.DATE_FORMAT)
      .required(VALIDATION_MESSAGE_KEYS.REQUIRED),
    [CALCULATION_EMPLOYMENT_KEYS.END_DATE]: Yup.string()
      .typeError(VALIDATION_MESSAGE_KEYS.DATE_FORMAT)
      .required(VALIDATION_MESSAGE_KEYS.REQUIRED),
    [EMPLOYEE_KEYS.VACATION_MONEY]: validateNumberField(0, MAX_MONTHLY_PAY, {
      required: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
      typeError: t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
    }),
    [EMPLOYEE_KEYS.MONTHLY_PAY]: validateNumberField(0, MAX_MONTHLY_PAY, {
      required: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
      typeError: t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
    }),
    [EMPLOYEE_KEYS.OTHER_EXPENSES]: validateNumberField(0, MAX_MONTHLY_PAY, {
      required: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
      typeError: t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
    }),
  });
