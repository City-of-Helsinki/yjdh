import { validateNumberField } from '@frontend/benefit-shared/src/utils/validation';
import { CALCULATION_SALARY_KEYS } from 'benefit/handler/constants';
import {
  CALCULATION_EMPLOYMENT_KEYS,
  EMPLOYEE_KEYS,
  MAX_MONTHLY_PAY,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import { CalculationCommon } from 'benefit-shared/types/application';
import { validateDateWithinMonths } from 'benefit-shared/utils/dates';
import { subMonths } from 'date-fns';
import { TFunction } from 'next-i18next';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import * as Yup from 'yup';

export const getValidationSchema = (
  t: TFunction
): Yup.SchemaOf<CalculationCommon> =>
  Yup.object().shape({
    [CALCULATION_EMPLOYMENT_KEYS.START_DATE]: Yup.string()
      .typeError(VALIDATION_MESSAGE_KEYS.DATE_FORMAT)
      .required(VALIDATION_MESSAGE_KEYS.REQUIRED)
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
          min: convertToUIDateFormat(subMonths(new Date(), 60)),
        }),
        test: (value = '') => validateDateWithinMonths(value, 60),
      }),
    [CALCULATION_EMPLOYMENT_KEYS.END_DATE]: Yup.string()
      .typeError(VALIDATION_MESSAGE_KEYS.DATE_FORMAT)
      .matches(/^\d+\.\d+\.20\d{2}$/, VALIDATION_MESSAGE_KEYS.DATE_FORMAT)
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

export const getManualValidationSchema = (
  t: TFunction
): Yup.SchemaOf<CalculationCommon> =>
  getValidationSchema(t).shape({
    [CALCULATION_SALARY_KEYS.OVERRIDE_MONTHLY_BENEFIT_AMOUNT]:
      validateNumberField(0, 800, {
        required: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
        typeError: t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
      }),
    [CALCULATION_SALARY_KEYS.OVERRIDE_MONTHLY_BENEFIT_AMOUNT_COMMENT]:
      Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
  });
