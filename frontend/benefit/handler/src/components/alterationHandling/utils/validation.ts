import { VALIDATION_MESSAGE_KEYS } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import {
  validateIsAfterOrOnDate,
  validateIsBeforeOrOnDate,
} from 'benefit-shared/utils/dates';
import { TFunction } from 'next-i18next';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { getNumberValueOrNull } from 'shared/utils/string.utils';
import * as Yup from 'yup';

export const getValidationSchema = (
  application: Application,
  alteration: ApplicationAlteration,
  t: TFunction
): Yup.AnyObjectSchema => {
  const testRecoveryDateMin: Yup.TestConfig<string | null | undefined> = {
    message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
      min: convertToUIDateFormat(application.startDate ?? ''),
    }),
    test: (value = ''): boolean =>
      validateIsAfterOrOnDate(value ?? '', application.startDate ?? ''),
  };

  const testRecoveryDateMax: Yup.TestConfig<string | null | undefined> = {
    message: t(VALIDATION_MESSAGE_KEYS.DATE_MAX, {
      max: convertToUIDateFormat(application.endDate ?? ''),
    }),
    test: (value = ''): boolean =>
      validateIsBeforeOrOnDate(value ?? '', application.endDate ?? ''),
  };

  return Yup.object().shape({
    application: Yup.string()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
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
        (
          recoveryStartDate: string | undefined,
          schema: Yup.StringSchema<string | null | undefined, object>
        ) =>
          schema.test({
            message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
              min: convertToUIDateFormat(recoveryStartDate),
            }),
            test: (value: string | null | undefined) =>
              recoveryStartDate
                ? validateIsAfterOrOnDate(value ?? '', recoveryStartDate)
                : true,
          })
      ),
    manualRecoveryAmount: Yup.string().when('isManual', {
      is: (isManual: boolean) => isManual === true,
      then: (schema) =>
        schema
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
          .test(
            'is-numeric',
            t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
            (value) => {
              if (value === null || value === undefined) return true;
              return (
                !Number.isNaN(parseFloat(value)) &&
                Number.isFinite(parseFloat(value))
              );
            }
          )
          .test(
            'min-value',
            t(VALIDATION_MESSAGE_KEYS.NUMBER_MIN, { min: 0 }),
            (value) => {
              if (value === null || value === undefined) return true;
              return parseFloat(value) >= 0;
            }
          )
          .test(
            'max-value',
            t(VALIDATION_MESSAGE_KEYS.NUMBER_MAX, {
              max: application?.calculation?.calculatedBenefitAmount,
            }),
            (value) => {
              if (value === null || value === undefined) return true;
              return (
                parseFloat(value) <=
                (application?.calculation?.calculatedBenefitAmount
                  ? Number(application.calculation.calculatedBenefitAmount)
                  : Infinity)
              );
            }
          ),
    }),
    isManual: Yup.boolean()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    isRecoverable: Yup.boolean()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
      .when('recoveryAmount', {
        is: (recoveryAmount: string) =>
          getNumberValueOrNull(recoveryAmount) === 0,
        then: (schema) =>
          schema.oneOf([false], t(VALIDATION_MESSAGE_KEYS.EMPTY_RECOVERY)),
      }),
    recoveryJustification: Yup.string()
      .nullable()
      .when('isRecoverable', {
        is: (isRecoverable: boolean) => isRecoverable === false,
        then: (schema) => schema.required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
  });
};
