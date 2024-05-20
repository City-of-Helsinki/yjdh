import { VALIDATION_MESSAGE_KEYS } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import {
  validateIsAfterOrOnDate,
  validateIsBeforeOrOnDate,
} from 'benefit-shared/utils/dates';
import { validateNumberField } from 'benefit-shared/utils/validation';
import { TFunction } from 'next-i18next';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import * as Yup from 'yup';
import { RequiredNumberSchema } from 'yup/lib/number';
import { RequiredStringSchema } from 'yup/lib/string';

export const getValidationSchema = (
  application: Application,
  alteration: ApplicationAlteration,
  t: TFunction
): unknown => {
  const testRecoveryDateMin: Yup.TestConfig<string> = {
    message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
      min: convertToUIDateFormat(application.startDate),
    }),
    test: (value = ''): boolean =>
      validateIsAfterOrOnDate(value, application.startDate),
  };

  const testRecoveryDateMax: Yup.TestConfig<string> = {
    message: t(VALIDATION_MESSAGE_KEYS.DATE_MAX, {
      max: convertToUIDateFormat(application.endDate),
    }),
    test: (value = ''): boolean =>
      validateIsBeforeOrOnDate(value, application.endDate),
  };

  return Yup.object().shape({
    application: Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    recoveryStartDate: Yup.string()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
      .test(testRecoveryDateMin)
      .test(testRecoveryDateMax),
    recoveryEndDate: Yup.string()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
      .test(testRecoveryDateMin)
      .test(testRecoveryDateMax)
      .when(
        'recoveryStartDate',
        (recoveryStartDate: string, schema: RequiredStringSchema<string>) =>
          schema.test({
            message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
              min: convertToUIDateFormat(recoveryStartDate),
            }),
            test: (value = '') =>
              recoveryStartDate
                ? validateIsAfterOrOnDate(value, recoveryStartDate)
                : true,
          })
      ),
    recoveryAmount: validateNumberField(
      0,
      application?.calculation?.calculatedBenefitAmount
        ? Number(application.calculation.calculatedBenefitAmount)
        : Infinity,
      {
        required: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
        typeError: t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
      }
    ).when('isRecoverable', {
      is: (isRecoverable) => isRecoverable === true,
      then: (schema: RequiredNumberSchema<number>) =>
        schema.min(0.01, t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    }),
    isRecoverable: Yup.boolean().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    recoveryJustification: Yup.string().required(
      t(VALIDATION_MESSAGE_KEYS.REQUIRED)
    ),
  });
};
