import {
  EMPLOYEE_MAX_WORKING_HOURS,
  EMPLOYEE_MIN_WORKING_HOURS,
  MAX_SHORT_STRING_LENGTH,
} from 'benefit/applicant/constants';
import {
  APPLICATION_FIELDS_STEP2_KEYS,
  EMPLOYEE_KEYS,
  ORGANIZATION_TYPES,
  PAY_SUBSIDY_TYPES,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import startOfYear from 'date-fns/startOfYear';
import { FinnishSSN } from 'finnish-ssn';
import { TFunction } from 'next-i18next';
import { NAMES_REGEX } from 'shared/constants';
import {
  convertToUIDateFormat,
  validateDateIsFromCurrentYearOnwards,
} from 'shared/utils/date.utils';
import { getNumberValue } from 'shared/utils/string.utils';
import * as Yup from 'yup';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getValidationSchema = (
  organizationType: string | undefined,
  t: TFunction
) =>
  Yup.object().shape({
    [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED]: Yup.mixed()
      .oneOf([null, ...Object.values(PAY_SUBSIDY_TYPES)])
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    // TODO: OPPISOPIMUSVALIDAATIO JOS PAY_SUBSIdY_TYPE != none
    [APPLICATION_FIELDS_STEP2_KEYS.APPRENTICESHIP_PROGRAM]: Yup.boolean()
      .nullable()
      .when(APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED, {
        is: (): PAY_SUBSIDY_TYPES =>
          PAY_SUBSIDY_TYPES.DEFAULT || PAY_SUBSIDY_TYPES.AGED,
        then: Yup.boolean()
          .nullable()
          .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      }),
    [APPLICATION_FIELDS_STEP2_KEYS.START_DATE]: Yup.string()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
          min: convertToUIDateFormat(startOfYear(new Date())),
        }),
        test: (value = '') => validateDateIsFromCurrentYearOnwards(value),
      }),
    [APPLICATION_FIELDS_STEP2_KEYS.END_DATE]: Yup.string().required(
      t(VALIDATION_MESSAGE_KEYS.REQUIRED)
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE]: Yup.object().shape({
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
      [EMPLOYEE_KEYS.IS_LIVING_IN_HELSINKI]: Yup.boolean().oneOf(
        [true],
        t(VALIDATION_MESSAGE_KEYS.REQUIRED_IS_LIVING_IN_HELSINKI)
      ),
      [APPLICATION_FIELDS_STEP2_KEYS.ASSOCIATION_IMMEDIATE_MANAGER_CHECK]:
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
      [EMPLOYEE_KEYS.JOB_TITLE]: Yup.string()
        .nullable()
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      [EMPLOYEE_KEYS.WORKING_HOURS]: Yup.number()
        .transform((_value, originalValue) =>
          Number(getNumberValue(originalValue))
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
      [EMPLOYEE_KEYS.VACATION_MONEY]: Yup.number()
        .transform((_value, originalValue) => getNumberValue(originalValue))
        .typeError(t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID))
        .nullable()
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      [EMPLOYEE_KEYS.MONTHLY_PAY]: Yup.number()
        .transform((_value, originalValue) => getNumberValue(originalValue))
        .typeError(t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID))
        .nullable()
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      [EMPLOYEE_KEYS.OTHER_EXPENSES]: Yup.number()
        .transform((_value, originalValue) => getNumberValue(originalValue))
        .typeError(t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID))
        .nullable()
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    }),
  });
