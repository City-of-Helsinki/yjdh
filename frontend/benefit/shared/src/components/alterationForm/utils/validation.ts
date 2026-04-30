import {
  ALTERATION_TYPE,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import {
  validateIsAfterOrOnDate,
  validateIsBeforeOrOnDate,
} from 'benefit-shared/utils/dates';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import * as Yup from 'yup';

type TranslatorFn = {
  (key: string, options?: Record<string, unknown>): string;
  (
    key: string,
    defaultValue: string,
    options?: Record<string, unknown>
  ): string;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getValidationSchema = (application: Application, t: TranslatorFn) => {
  const einvoiceRequired = Yup.string().when('useEinvoice', {
    is: true,
    then: Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
  });

  return Yup.object().shape({
    application: Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    alterationType: Yup.mixed()
      .oneOf([...Object.values(ALTERATION_TYPE)])
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    endDate: Yup.string()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
          min: convertToUIDateFormat(application.startDate),
        }),
        test: (value = '') =>
          validateIsAfterOrOnDate(value as string, application.startDate ?? ''),
      })
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MAX, {
          max: convertToUIDateFormat(application.endDate),
        }),
        test: (value = '') =>
          validateIsBeforeOrOnDate(value as string, application.endDate ?? ''),
      }),
    resumeDate: Yup.string()
      .nullable()
      .when('alterationType', {
        is: ALTERATION_TYPE.SUSPENSION,
        then: Yup.string()
          .nullable()
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
          .test({
            message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
              min: convertToUIDateFormat(application.startDate),
            }),
            test: (value = '') =>
              validateIsAfterOrOnDate(
                value as string,
                application.startDate ?? ''
              ),
          })
          .test({
            message: t(VALIDATION_MESSAGE_KEYS.DATE_MAX, {
              max: convertToUIDateFormat(application.endDate),
            }),
            test: (value = '') =>
              validateIsBeforeOrOnDate(
                value as string,
                application.endDate ?? ''
              ),
          })

          .when('endDate', (endDate: string, schema: Yup.AnySchema) =>
            schema.test({
              message: t(
                'common:applications.alterations.new.validation.resumeDateBeforeEndDate'
              ),
              test: (value: unknown) =>
                !validateIsBeforeOrOnDate((value as string) ?? '', endDate ?? ''),
            })
          ),
      }),
    reason: Yup.string(),
    contactPersonName: Yup.string().required(
      t(VALIDATION_MESSAGE_KEYS.REQUIRED)
    ),
    useEinvoice: Yup.boolean().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    einvoiceProviderName: einvoiceRequired,
    einvoiceProviderIdentifier: einvoiceRequired,
    einvoiceAddress: einvoiceRequired,
  });
};
