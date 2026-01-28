import { validateNumberField } from '@frontend/benefit-shared/src/utils/validation';
import {
  APPLICATION_START_DATE,
  APPLICATION_START_DATE_WITHIN_MONTHS,
  EMPLOYEE_MAX_WORKING_HOURS,
  EMPLOYEE_MIN_WORKING_HOURS,
  MAX_SHORT_STRING_LENGTH,
} from 'benefit/applicant/constants';
import {
  APPLICATION_FIELDS_STEP2_KEYS,
  EMPLOYEE_KEYS,
  MAX_MONTHLY_PAY,
  ORGANIZATION_TYPES,
  PAY_SUBSIDY_GRANTED,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import {
  getDateFromDateString,
  validateDateWithinMonths,
  validateIsAfterOrOnDate,
} from 'benefit-shared/utils/dates';
import addDays from 'date-fns/addDays';
import { FinnishSSN } from 'finnish-ssn';
import { TFunction } from 'next-i18next';
import { NAMES_REGEX } from 'shared/constants';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import * as Yup from 'yup';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getValidationSchema = (
  organizationType: string | undefined,
  t: TFunction
) =>
  Yup.object().shape({
    [APPLICATION_FIELDS_STEP2_KEYS.APPRENTICESHIP_PROGRAM]: Yup.boolean()
      .nullable()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [APPLICATION_FIELDS_STEP2_KEYS.START_DATE]: Yup.string()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
          min: convertToUIDateFormat(APPLICATION_START_DATE),
        }),
        test: (value = '') =>
          validateDateWithinMonths(value, APPLICATION_START_DATE_WITHIN_MONTHS),
      }),
    [APPLICATION_FIELDS_STEP2_KEYS.END_DATE]: Yup.string()
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED))
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
          min: '30 päivää aloituspäivästä',
        }),
        test: (endDate: string, context) =>
          validateIsAfterOrOnDate(
            endDate,
            convertToUIDateFormat(
              addDays(
                getDateFromDateString(
                  String(
                    (context?.parent as { startDate?: string })?.startDate
                  ) || '30.12.2100'
                ),
                30
              )
            )
          ),
      }),
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
      [EMPLOYEE_KEYS.JOB_TITLE]: Yup.string()
        .nullable()
        .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
      [EMPLOYEE_KEYS.WORKING_HOURS]: validateNumberField(
        EMPLOYEE_MIN_WORKING_HOURS,
        EMPLOYEE_MAX_WORKING_HOURS,
        {
          required: t(VALIDATION_MESSAGE_KEYS.REQUIRED),
          typeError: t(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID),
        }
      ),
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
      [EMPLOYEE_KEYS.COLLECTIVE_BARGAINING_AGREEMENT]: Yup.string().required(
        t(VALIDATION_MESSAGE_KEYS.REQUIRED)
      ),
    }),
  });
