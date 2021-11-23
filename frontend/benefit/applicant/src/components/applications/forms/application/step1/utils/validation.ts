import {
  APPLICATION_FIELDS_STEP1_KEYS,
  MAX_LONG_STRING_LENGTH,
  MAX_PHONE_NUMBER_LENGTH,
  MAX_SHORT_STRING_LENGTH,
  MIN_PHONE_NUMBER_LENGTH,
  ORGANIZATION_TYPES,
  SUPPORTED_LANGUAGES,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import { Step1 } from 'benefit/applicant/types/application';
import { TFunction } from 'next-i18next';
import {
  ADDRESS_REGEX,
  CITY_REGEX,
  COMPANY_BANK_ACCOUNT_NUMBER,
  NAMES_REGEX,
  PHONE_NUMBER_REGEX,
  POSTAL_CODE_REGEX,
} from 'shared/constants';
import * as Yup from 'yup';

import { getValidationSchema as getDeminimisValidationSchema } from '../../deMinimisAid/utils/validation';

export const getValidationSchema = (
  organizationType: string | undefined,
  t: TFunction
): Yup.SchemaOf<Step1> =>
  Yup.object().shape({
    [APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS]: Yup.boolean(),
    [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_DEPARTMENT]: Yup.string()
      .max(MAX_LONG_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
      .when(APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS, {
        is: true,
        then: Yup.string(),
      }),
    [APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS]:
      Yup.string()
        .matches(ADDRESS_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
        .max(MAX_LONG_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
        .when(APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS, {
          is: true,
          then: Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
        }),
    [APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_POSTCODE]: Yup.string()
      .matches(POSTAL_CODE_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
      .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
      .when(APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS, {
        is: true,
        then: Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_CITY]: Yup.string()
      .matches(CITY_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
      .max(MAX_LONG_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
      .when(APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS, {
        is: true,
        then: Yup.string().required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER]: Yup.string()
      .matches(
        COMPANY_BANK_ACCOUNT_NUMBER,
        t(VALIDATION_MESSAGE_KEYS.IBAN_INVALID)
      )
      .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES]:
      Yup.boolean()
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
    [APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_IMMEDIATE_MANAGER_CHECK]:
      Yup.boolean()
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
    [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_FIRST_NAME]:
      Yup.string()
        .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
        .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_LAST_NAME]:
      Yup.string()
        .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
        .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]:
      Yup.string()
        .matches(PHONE_NUMBER_REGEX, t(VALIDATION_MESSAGE_KEYS.PHONE_INVALID))
        .min(MIN_PHONE_NUMBER_LENGTH, t(VALIDATION_MESSAGE_KEYS.NUMBER_MIN))
        .max(MAX_PHONE_NUMBER_LENGTH, t(VALIDATION_MESSAGE_KEYS.NUMBER_MAX))
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_EMAIL]: Yup.string()
      .email(t(VALIDATION_MESSAGE_KEYS.EMAIL_INVALID))
      .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP1_KEYS.APPLICANT_LANGUAGE]: Yup.mixed()
      .oneOf(
        Object.values(SUPPORTED_LANGUAGES),
        t(VALIDATION_MESSAGE_KEYS.INVALID)
      )
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID]: Yup.boolean()
      .nullable()
      .when(APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES, {
        is: true,
        then: Yup.boolean()
          .nullable()
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID_SET]: Yup.array().of(
      getDeminimisValidationSchema(t).nullable()
    ),
    [APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS]: Yup.boolean()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]:
      Yup.string(),
  });
