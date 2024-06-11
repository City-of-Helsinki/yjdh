import {
  getMaxEndDate,
  getMinEndDate,
} from '@frontend/benefit-shared/src/utils/dates';
import {
  APPLICATION_FIELD_KEYS,
  APPLICATION_FIELDS,
  APPLICATION_INITIAL_VALUES,
} from 'benefit/handler/constants';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import {
  APPLICATION_ORIGINS,
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
  EMPLOYEE_KEYS,
  PAY_SUBSIDY_OPTIONS,
  TRUTHY_SUBSIDIES,
} from 'benefit-shared/constants';
import { ApplicationData } from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import isAfter from 'date-fns/isAfter';
import isValid from 'date-fns/isValid';
import isWithinInterval from 'date-fns/isWithinInterval';
import { FormikErrors } from 'formik';
import fromPairs from 'lodash/fromPairs';
import isEmpty from 'lodash/isEmpty';
import { TFunction } from 'next-i18next';
import { Field } from 'shared/components/forms/fields/types';
import hdsToast from 'shared/components/toast/Toast';
import { BenefitAttachment } from 'shared/types/attachment';
import { OptionType } from 'shared/types/common';
import { convertToUIDateFormat, parseDate } from 'shared/utils/date.utils';
import { stringToFloatValue } from 'shared/utils/string.utils';
import { isString } from 'shared/utils/type-guards';

type DatesType = {
  minEndDate: Date | undefined;
  minEndDateFormatted: string | undefined;
  maxEndDate: Date | undefined;
  isEndDateEligible: boolean | undefined;
};

const getApplication = (
  applicationData?: ApplicationData,
  id?: string | null,
  isNewApplication = true
): Application =>
  applicationData
    ? camelcaseKeys(
        {
          ...applicationData,
          start_date: convertToUIDateFormat(applicationData.start_date),
          end_date: convertToUIDateFormat(applicationData.end_date),
          paper_application_date: convertToUIDateFormat(
            applicationData.paper_application_date
          ),
          calculation: applicationData.calculation
            ? {
                ...applicationData.calculation,
                monthly_pay: String(
                  stringToFloatValue(applicationData.calculation.monthly_pay)
                ),
                other_expenses: String(
                  stringToFloatValue(applicationData.calculation.other_expenses)
                ),
                vacation_money: String(
                  stringToFloatValue(applicationData.calculation.vacation_money)
                ),
                override_monthly_benefit_amount: String(
                  stringToFloatValue(
                    applicationData.calculation.override_monthly_benefit_amount
                  )
                ),
              }
            : undefined,
        },
        {
          deep: true,
        }
      )
    : {
        ...APPLICATION_INITIAL_VALUES,
        id,
        status: isNewApplication
          ? APPLICATION_STATUSES.DRAFT
          : APPLICATION_STATUSES.HANDLING,
      };

const getFields = (t: TFunction, tSections: string): ApplicationFields => {
  type EmployeeFieldName =
    `${APPLICATION_FIELD_KEYS.EMPLOYEE}.${EMPLOYEE_KEYS}`;

  const fieldMasks: Partial<Record<Field['name'], Field['mask']>> = {
    [APPLICATION_FIELD_KEYS.COMPANY_BANK_ACCOUNT_NUMBER]: {
      format: 'FI99 9999 9999 9999 99',
      stripVal: (val: string) => val.replace(/\s/g, ''),
    },
  };

  const fieldsPairs: (
    | [APPLICATION_FIELD_KEYS, Field]
    | [
        APPLICATION_FIELD_KEYS.EMPLOYEE,
        Record<EMPLOYEE_KEYS, Field<EmployeeFieldName>>
      ]
  )[] = Object.values(APPLICATION_FIELDS).map((fieldName) => {
    if (isString(fieldName)) {
      return [
        fieldName,
        {
          name: fieldName,
          label: t(`${tSections}.fields.${fieldName}.label`),
          placeholder: t(`${tSections}.fields.${fieldName}.placeholder`),
          mask: fieldMasks[fieldName],
        },
      ];
    }
    const employeeFields: [EMPLOYEE_KEYS, Field<EmployeeFieldName>][] =
      Object.values(fieldName).map((employeeField) => [
        employeeField,
        {
          name: `${APPLICATION_FIELD_KEYS.EMPLOYEE}.${employeeField}`,
          label: t(`${tSections}.fields.${employeeField}.label`),
          placeholder: t(`${tSections}.fields.${employeeField}.placeholder`),
        },
      ]);

    const employeeDict = fromPairs(employeeFields) as Record<
      EMPLOYEE_KEYS,
      Field<EmployeeFieldName>
    >;

    return [APPLICATION_FIELD_KEYS.EMPLOYEE, employeeDict];
  });

  return fromPairs<Field | Record<EMPLOYEE_KEYS, Field<EmployeeFieldName>>>(
    fieldsPairs
  ) as ApplicationFields;
};

const errorToast = (label: string, text: string, dismissTime = 0): void => {
  hdsToast({
    autoDismissTime: dismissTime,
    type: 'error',
    labelText: label,
    text,
  });
};

const handleErrorFieldKeys = (
  errorFieldKey: APPLICATION_FIELD_KEYS | APPLICATION_FIELD_KEYS.EMPLOYEE,
  errs: FormikErrors<unknown>
): APPLICATION_FIELD_KEYS | APPLICATION_FIELD_KEYS.EMPLOYEE => {
  let newErrorFieldKey = errorFieldKey;
  if (errorFieldKey === APPLICATION_FIELD_KEYS.EMPLOYEE) {
    const employeeFieldKey = Object.keys(
      (errs[errorFieldKey] as APPLICATION_FIELD_KEYS.EMPLOYEE) ?? {}
    )[0];
    newErrorFieldKey = [APPLICATION_FIELD_KEYS.EMPLOYEE, employeeFieldKey].join(
      '.'
    ) as APPLICATION_FIELD_KEYS.EMPLOYEE;
  }
  return newErrorFieldKey;
};

const getDates = (values: Application): DatesType => {
  const minEndDate = getMinEndDate(values.startDate, true);
  const minEndDateFormatted = convertToUIDateFormat(minEndDate);
  const maxEndDate = getMaxEndDate(values.startDate, 24);
  const endDate = parseDate(values.endDate);
  const isEndDateEligible =
    endDate &&
    (isValid(maxEndDate) && maxEndDate
      ? isWithinInterval(endDate, { start: minEndDate, end: maxEndDate })
      : isAfter(endDate, minEndDate));
  return {
    minEndDate,
    minEndDateFormatted,
    maxEndDate,
    isEndDateEligible,
  };
};

const getSubsidyOptions = (): OptionType[] =>
  PAY_SUBSIDY_OPTIONS.map((option) => ({
    label: `${option}%`,
    value: option,
  }));

const requiredAttachments = (
  values: Application,
  isFormActionNew: boolean
): boolean => {
  const hasFullApplication = isFormActionNew
    ? !isEmpty(
        values.attachments?.find(
          (att: BenefitAttachment) =>
            att.attachmentType === ATTACHMENT_TYPES.FULL_APPLICATION
        )
      )
    : true;
  const hasWorkContract = !isEmpty(
    values.attachments?.find(
      (att: BenefitAttachment) =>
        att.attachmentType === ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT
    )
  );
  let hasPaySubsidyDecision = true;
  if (TRUTHY_SUBSIDIES.has(values.paySubsidyGranted)) {
    hasPaySubsidyDecision = !isEmpty(
      values?.attachments?.find(
        (att: BenefitAttachment) =>
          att.attachmentType === ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT
      )
    );
  }
  let hasApprenticeshipProgram = true;
  if (values.apprenticeshipProgram) {
    hasApprenticeshipProgram = !isEmpty(
      values?.attachments?.find(
        (att: BenefitAttachment) =>
          att.attachmentType === ATTACHMENT_TYPES.EDUCATION_CONTRACT
      )
    );
  }

  let hasApplicantConsent = true;
  if (values.applicationOrigin === APPLICATION_ORIGINS.APPLICANT) {
    hasApplicantConsent = !isEmpty(
      values?.attachments?.find(
        (att: BenefitAttachment) =>
          att.attachmentType === ATTACHMENT_TYPES.EMPLOYEE_CONSENT
      )
    );
  }
  return (
    hasWorkContract &&
    hasFullApplication &&
    hasPaySubsidyDecision &&
    hasApprenticeshipProgram &&
    hasApplicantConsent
  );
};

export {
  errorToast,
  getApplication,
  getDates,
  getFields,
  getSubsidyOptions,
  handleErrorFieldKeys,
  requiredAttachments,
};
