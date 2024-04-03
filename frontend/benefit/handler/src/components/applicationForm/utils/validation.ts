import {
  APPLICATION_FIELD_KEYS,
  EMPLOYEE_MAX_WORKING_HOURS,
  EMPLOYEE_MIN_WORKING_HOURS,
  MAX_LONG_STRING_LENGTH,
  MAX_PHONE_NUMBER_LENGTH,
  MAX_SHORT_STRING_LENGTH,
  MIN_PHONE_NUMBER_LENGTH,
  SUPPORTED_LANGUAGES,
} from 'benefit/handler/constants';
import {
  EMPLOYEE_KEYS,
  MAX_MONTHLY_PAY,
  ORGANIZATION_TYPES,
  PAY_SUBSIDY_GRANTED,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import {
  validateDateWithinMonths,
  validateIsTodayOrPastDate,
} from 'benefit-shared/utils/dates';
import { validateNumberField } from 'benefit-shared/utils/validation';
import subMonths from 'date-fns/subMonths';
import { FinnishSSN } from 'finnish-ssn';
import { TFunction } from 'next-i18next';
import {
  ADDRESS_REGEX,
  CITY_REGEX,
  COMPANY_BANK_ACCOUNT_NUMBER,
  NAMES_REGEX,
  PHONE_NUMBER_REGEX,
  POSTAL_CODE_REGEX,
} from 'shared/constants';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { getNumberValueOrNull } from 'shared/utils/string.utils';
import * as Yup from 'yup';

import { getValidationSchema as getDeminimisValidationSchema } from '../formContent/companySection/deMinimisAid/utils/validation';

export const getValidationSchema = (
  organizationType: string | undefined,
  t: TFunction
): unknown =>
  Yup.object().shape({
    [APPLICATION_FIELD_KEYS.USE_ALTERNATIVE_ADDRESS]: Yup.boolean(),
    [APPLICATION_FIELD_KEYS.COMPANY_DEPARTMENT]: Yup.string()
      .max(
        MAX_LONG_STRING_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.STRING_MAX, { max: MAX_LONG_STRING_LENGTH })
      )
      .when(APPLICATION_FIELD_KEYS.USE_ALTERNATIVE_ADDRESS, {
        is: true,
        then: Yup.string(),
      }),
    [APPLICATION_FIELD_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS]: Yup.string()
      .matches(ADDRESS_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
      .max(
        MAX_LONG_STRING_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.STRING_MAX, { max: MAX_LONG_STRING_LENGTH })
      )
      .when(APPLICATION_FIELD_KEYS.USE_ALTERNATIVE_ADDRESS, {
        is: true,
        then: Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELD_KEYS.ALTERNATIVE_COMPANY_POSTCODE]: Yup.string()
      .matches(POSTAL_CODE_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
      .max(
        MAX_SHORT_STRING_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.STRING_MAX, { max: MAX_LONG_STRING_LENGTH })
      )
      .when(APPLICATION_FIELD_KEYS.USE_ALTERNATIVE_ADDRESS, {
        is: true,
        then: Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELD_KEYS.ALTERNATIVE_COMPANY_CITY]: Yup.string()
      .matches(CITY_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
      .max(
        MAX_LONG_STRING_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.STRING_MAX, { max: MAX_LONG_STRING_LENGTH })
      )
      .when(APPLICATION_FIELD_KEYS.USE_ALTERNATIVE_ADDRESS, {
        is: true,
        then: Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELD_KEYS.COMPANY_BANK_ACCOUNT_NUMBER]: Yup.string()
      .matches(
        COMPANY_BANK_ACCOUNT_NUMBER,
        t(VALIDATION_MESSAGE_KEYS.IBAN_INVALID)
      )
      .max(
        MAX_SHORT_STRING_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.STRING_MAX, { max: MAX_LONG_STRING_LENGTH })
      )
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELD_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES]: Yup.boolean()
      .nullable()
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
        test: (val) => {
          if (
            organizationType?.toLowerCase() ===
            ORGANIZATION_TYPES.ASSOCIATION.toLowerCase()
          )
            return typeof val === 'boolean';

          return true;
        },
      }),
    [APPLICATION_FIELD_KEYS.ASSOCIATION_IMMEDIATE_MANAGER_CHECK]: Yup.boolean()
      .nullable()
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
        test: (val) => {
          if (
            organizationType?.toLowerCase() ===
            ORGANIZATION_TYPES.ASSOCIATION.toLowerCase()
          )
            return val === true;

          return true;
        },
      }),
    [APPLICATION_FIELD_KEYS.COMPANY_CONTACT_PERSON_FIRST_NAME]: Yup.string()
      .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
      .max(
        MAX_SHORT_STRING_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.STRING_MAX, { max: MAX_LONG_STRING_LENGTH })
      )
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELD_KEYS.COMPANY_CONTACT_PERSON_LAST_NAME]: Yup.string()
      .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
      .max(
        MAX_SHORT_STRING_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.STRING_MAX, { max: MAX_LONG_STRING_LENGTH })
      )
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELD_KEYS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]: Yup.string()
      .matches(PHONE_NUMBER_REGEX, t(VALIDATION_MESSAGE_KEYS.PHONE_INVALID))
      .min(
        MIN_PHONE_NUMBER_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.NUMBER_MIN, {
          min: MIN_PHONE_NUMBER_LENGTH,
        })
      )
      .max(
        MAX_PHONE_NUMBER_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.PHONE_NUMBER_LENGTH_MAX, {
          max: MAX_PHONE_NUMBER_LENGTH,
        })
      )
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELD_KEYS.COMPANY_CONTACT_PERSON_EMAIL]: Yup.string()
      .email(t(VALIDATION_MESSAGE_KEYS.EMAIL_INVALID))
      .max(
        MAX_SHORT_STRING_LENGTH,
        t(VALIDATION_MESSAGE_KEYS.STRING_MAX, { max: MAX_LONG_STRING_LENGTH })
      )
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELD_KEYS.APPLICANT_LANGUAGE]: Yup.mixed()
      .oneOf(
        Object.values(SUPPORTED_LANGUAGES),
        t(VALIDATION_MESSAGE_KEYS.INVALID)
      )
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELD_KEYS.DE_MINIMIS_AID]: Yup.boolean()
      .nullable()
      .when(APPLICATION_FIELD_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES, {
        is: true,
        then: Yup.boolean()
          .nullable()
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      })
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
        test: (val) => {
          if (
            organizationType?.toLowerCase() ===
            ORGANIZATION_TYPES.COMPANY.toLowerCase()
          ) {
            return typeof val === 'boolean';
          }
          return true;
        },
      }),
    [APPLICATION_FIELD_KEYS.DE_MINIMIS_AID_SET]: Yup.array().of(
      getDeminimisValidationSchema(t).nullable()
    ),
    [APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS]: Yup.boolean()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]:
      Yup.string(),
    [APPLICATION_FIELD_KEYS.PAY_SUBSIDY_GRANTED]: Yup.mixed().oneOf(
      Object.values(PAY_SUBSIDY_GRANTED),
      t(VALIDATION_MESSAGE_KEYS.INVALID)
    ),
    [APPLICATION_FIELD_KEYS.APPRENTICESHIP_PROGRAM]: Yup.boolean()
      .nullable()
      .when(APPLICATION_FIELD_KEYS.PAY_SUBSIDY_GRANTED, {
        is: (value: PAY_SUBSIDY_GRANTED) =>
          [
            PAY_SUBSIDY_GRANTED.GRANTED,
            PAY_SUBSIDY_GRANTED.GRANTED_AGED,
          ].includes(value),
        then: Yup.boolean()
          .nullable()
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELD_KEYS.EMPLOYEE]: Yup.object().shape({
      [EMPLOYEE_KEYS.FIRST_NAME]: Yup.string()
        .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
        .max(
          MAX_SHORT_STRING_LENGTH,
          t(VALIDATION_MESSAGE_KEYS.STRING_MAX, {
            max: MAX_LONG_STRING_LENGTH,
          })
        )
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      [EMPLOYEE_KEYS.LAST_NAME]: Yup.string()
        .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
        .max(
          MAX_SHORT_STRING_LENGTH,
          t(VALIDATION_MESSAGE_KEYS.STRING_MAX, {
            max: MAX_LONG_STRING_LENGTH,
          })
        )
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      [EMPLOYEE_KEYS.SOCIAL_SECURITY_NUMBER]: Yup.string()
        .test({
          message: t(VALIDATION_MESSAGE_KEYS.SSN_INVALID),
          test: (val) => (val ? FinnishSSN.validate(val) : true),
        })
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      [EMPLOYEE_KEYS.IS_LIVING_IN_HELSINKI]: Yup.boolean().oneOf(
        [true],
        t('common:applications.sections.fields.isLivingInHelsinki.error')
      ),
      [EMPLOYEE_KEYS.JOB_TITLE]: Yup.string()
        .nullable()
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      [EMPLOYEE_KEYS.WORKING_HOURS]: Yup.number()
        .test(
          'is-decimal',
          t(VALIDATION_MESSAGE_KEYS.NUMBER_TWO_DECIMALS),
          (value: number): boolean =>
            value ? /^\d+.?\d{1,2}$/.test(String(value)) : false
        )
        .transform((_value, originalValue) =>
          Number(getNumberValueOrNull(originalValue))
        )
        .typeError(t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID))
        .nullable()
        .min(EMPLOYEE_MIN_WORKING_HOURS, (param) => ({
          min: param.min,
          key: VALIDATION_MESSAGE_KEYS.NUMBER_MIN,
        }))
        .max(EMPLOYEE_MAX_WORKING_HOURS, (param) => ({
          max: param.max,
          key: VALIDATION_MESSAGE_KEYS.NUMBER_MAX,
        }))
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      [EMPLOYEE_KEYS.MONTHLY_PAY]: validateNumberField(0, MAX_MONTHLY_PAY, {
        required: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
        typeError: t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
      }),
      [EMPLOYEE_KEYS.VACATION_MONEY]: validateNumberField(0, MAX_MONTHLY_PAY, {
        required: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
        typeError: t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
      }),
      [EMPLOYEE_KEYS.OTHER_EXPENSES]: validateNumberField(0, MAX_MONTHLY_PAY, {
        required: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
        typeError: t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
      }),
      [EMPLOYEE_KEYS.COLLECTIVE_BARGAINING_AGREEMENT]: Yup.string().required(
        t(VALIDATION_MESSAGE_KEYS.REQUIRED)
      ),
    }),
    [APPLICATION_FIELD_KEYS.START_DATE]: Yup.string()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
          min: convertToUIDateFormat(subMonths(new Date(), 4)),
        }),
        test: (value = '') => validateDateWithinMonths(value, 4),
      }),
    [APPLICATION_FIELD_KEYS.END_DATE]: Yup.string().required(
      t(VALIDATION_MESSAGE_KEYS.REQUIRED)
    ),
    [APPLICATION_FIELD_KEYS.PAPER_APPLICATION_DATE]: Yup.string().test({
      message: t(VALIDATION_MESSAGE_KEYS.DATE_MAX, {
        max: convertToUIDateFormat(new Date()),
      }),
      test: (value = '') => value === '' || validateIsTodayOrPastDate(value),
    }),
  });
