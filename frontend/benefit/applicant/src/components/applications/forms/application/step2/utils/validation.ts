import {
  APPLICATION_FIELDS_STEP2_KEYS,
  BENEFIT_TYPES,
  EMPLOYEE_KEYS,
  EMPLOYEE_MAX_WORKING_HOURS,
  EMPLOYEE_MIN_WORKING_HOURS,
  MAX_PHONE_NUMBER_LENGTH,
  MAX_SHORT_STRING_LENGTH,
  MIN_PHONE_NUMBER_LENGTH,
  PAY_SUBSIDY_OPTIONS,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import { Step2 } from 'benefit/applicant/types/application';
import isThisYear from 'date-fns/isThisYear';
import startOfYear from 'date-fns/startOfYear';
import { FinnishSSN } from 'finnish-ssn';
import { TFunction } from 'next-i18next';
import { NAMES_REGEX, PHONE_NUMBER_REGEX } from 'shared/constants';
import { convertToUIDateFormat, parseDate } from 'shared/utils/date.utils';
import * as Yup from 'yup';

export const getValidationSchema = (t: TFunction): Yup.SchemaOf<Step2> =>
  Yup.object().shape({
    [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED]: Yup.boolean()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_PERCENT]: Yup.mixed()
      .nullable()
      .when(APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED, {
        is: true,
        then: Yup.mixed()
          .oneOf([...PAY_SUBSIDY_OPTIONS], t(VALIDATION_MESSAGE_KEYS.INVALID))
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELDS_STEP2_KEYS.ADDITIONAL_PAY_SUBSIDY_PERCENT]: Yup.mixed()
      .nullable()
      .when(APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED, {
        is: true,
        then: Yup.mixed().oneOf(
          [null, ...PAY_SUBSIDY_OPTIONS],
          t(VALIDATION_MESSAGE_KEYS.INVALID)
        ),
      }),
    [APPLICATION_FIELDS_STEP2_KEYS.APPRENTICESHIP_PROGRAM]: Yup.boolean()
      .nullable()
      .when(APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED, {
        is: true,
        then: Yup.boolean()
          .nullable()
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELDS_STEP2_KEYS.BENEFIT_TYPE]: Yup.mixed()
      .oneOf(
        [null, ...Object.values(BENEFIT_TYPES)],
        t(VALIDATION_MESSAGE_KEYS.INVALID)
      )
      .when(APPLICATION_FIELDS_STEP2_KEYS.APPRENTICESHIP_PROGRAM, {
        is: true,
        then: Yup.mixed().notOneOf([BENEFIT_TYPES.COMMISSION]),
      })
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP2_KEYS.START_DATE]: Yup.string()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
          min: convertToUIDateFormat(startOfYear(new Date())),
        }),
        test: (value = '') => {
          const date = parseDate(value);
          return date ? isThisYear(date) : false;
        },
      }),
    [APPLICATION_FIELDS_STEP2_KEYS.END_DATE]: Yup.string().required(
      t(VALIDATION_MESSAGE_KEYS.REQUIRED)
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE]: Yup.object()
      .shape({
        [EMPLOYEE_KEYS.FIRST_NAME]: Yup.string()
          .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
          .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
        [EMPLOYEE_KEYS.LAST_NAME]: Yup.string()
          .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
          .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX))
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
        [EMPLOYEE_KEYS.SOCIAL_SECURITY_NUMBER]: Yup.string()
          .test({
            message: t(VALIDATION_MESSAGE_KEYS.SSN_INVALID),
            test: (val) => (val ? FinnishSSN.validate(val) : true),
          })
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
        [EMPLOYEE_KEYS.PHONE_NUMBER]: Yup.string()
          .matches(PHONE_NUMBER_REGEX, t(VALIDATION_MESSAGE_KEYS.PHONE_INVALID))
          .min(MIN_PHONE_NUMBER_LENGTH, t(VALIDATION_MESSAGE_KEYS.NUMBER_MIN))
          .max(MAX_PHONE_NUMBER_LENGTH, t(VALIDATION_MESSAGE_KEYS.NUMBER_MAX))
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
        [EMPLOYEE_KEYS.IS_LIVING_IN_HELSINKI]: Yup.boolean().oneOf(
          [true],
          t(VALIDATION_MESSAGE_KEYS.REQUIRED)
        ),
      })
      .when(APPLICATION_FIELDS_STEP2_KEYS.BENEFIT_TYPE, {
        is: BENEFIT_TYPES.COMMISSION,
        then: Yup.object().shape({
          [EMPLOYEE_KEYS.COMMISSION_DESCRIPTION]: Yup.string()
            .nullable()
            .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
          [EMPLOYEE_KEYS.EMPLOYEE_COMMISSION_AMOUNT]: Yup.number()
            .typeError(t(VALIDATION_MESSAGE_KEYS.INVALID))
            .nullable()
            .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
        }),
        otherwise: Yup.object().shape({
          [EMPLOYEE_KEYS.JOB_TITLE]: Yup.string()
            .nullable()
            .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
          [EMPLOYEE_KEYS.WORKING_HOURS]: Yup.number()
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
          [EMPLOYEE_KEYS.VACATION_MONEY]: Yup.number()
            .nullable()
            .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
          [EMPLOYEE_KEYS.MONTHLY_PAY]: Yup.number()
            .nullable()
            .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
          [EMPLOYEE_KEYS.OTHER_EXPENSES]: Yup.number()
            .nullable()
            .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
        }),
      }),
  });
