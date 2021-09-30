import {
  APPLICATION_FIELDS_STEP2,
  APPLICATION_FIELDS_STEP2_KEYS,
  EMPLOYEE_KEYS,
  PAY_SUBSIDY_OPTIONS,
  SUPPORTED_LANGUAGES,
} from 'benefit/applicant/constants';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import { getErrorText } from 'benefit/applicant/utils/forms';
import isAfter from 'date-fns/isAfter';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import hdsToast from 'shared/components/toast/Toast';
import { OptionType } from 'shared/types/common';
import { DATE_FORMATS, formatDate, parseDate } from 'shared/utils/date.utils';
import { focusAndScroll } from 'shared/utils/dom.utils';
import snakecaseKeys from 'snakecase-keys';

import { getMinEndDate } from './utils/dates';
import { getValidationSchema } from './utils/validation';

type Step2Fields = Record<
  APPLICATION_FIELDS_STEP2_KEYS,
  Field<APPLICATION_FIELDS_STEP2_KEYS>
> &
  Record<
    APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE,
    Record<EMPLOYEE_KEYS, Field<APPLICATION_FIELDS_STEP2_KEYS>>
  >;

type UseApplicationFormStep2Props = {
  t: TFunction;
  language: SUPPORTED_LANGUAGES;
  fields: Step2Fields;
  translationsBase: string;
  minEndDate: Date;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmitBack: () => void;
  handleSubmitNext: () => void;
  clearBenefitValues: () => void;
  clearCommissionValues: () => void;
  clearContractValues: () => void;
  clearDatesValues: () => void;
  clearPaySubsidyValues: () => void;
  setEndDate: () => void;
  formik: FormikProps<Application>;
  subsidyOptions: OptionType[];
  getSelectValue: (fieldName: keyof Application) => OptionType | null;
};

const useApplicationFormStep2 = (
  application: Application
  // eslint-disable-next-line sonarjs/cognitive-complexity
): UseApplicationFormStep2Props => {
  const { t, i18n } = useTranslation();
  const translationsBase = 'common:applications.sections.employee';
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [step, setStep] = useState<number>(2);

  const { mutate: updateApplication, error: updateApplicationError } =
    useUpdateApplicationQuery();

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationError) {
      hdsToast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationError]);

  const formik = useFormik<Application>({
    initialValues: {
      ...application,
      [APPLICATION_FIELDS_STEP2.START_DATE]: application.startDate
        ? formatDate(parseDate(application.startDate))
        : undefined,
      [APPLICATION_FIELDS_STEP2.END_DATE]: application.endDate
        ? formatDate(parseDate(application.endDate))
        : undefined,
    },
    validationSchema: getValidationSchema(t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values) => {
      const currentApplicationData: ApplicationData = snakecaseKeys(
        {
          ...application,
          ...values,
          startDate: values.startDate
            ? formatDate(parseDate(values.startDate), DATE_FORMATS.DATE_BACKEND)
            : null,
          endDate: values.endDate
            ? formatDate(parseDate(values.endDate), DATE_FORMATS.DATE_BACKEND)
            : null,
          applicationStep: getApplicationStepString(step),
        },
        { deep: true }
      );
      updateApplication(currentApplicationData);
    },
  });

  const { values, errors, touched, setFieldValue } = formik;
  const subsidyOptions = React.useMemo(
    (): OptionType[] =>
      PAY_SUBSIDY_OPTIONS.map((option) => ({
        label: `${option}%`,
        value: option,
      })),
    []
  );

  const fields = React.useMemo(() => {
    type EmployeeFieldName =
      `${APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE}.${EMPLOYEE_KEYS}`;

    const fieldEntries: (
      | [APPLICATION_FIELDS_STEP2_KEYS, Field]
      | [
          APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE,
          Record<EMPLOYEE_KEYS, Field<EmployeeFieldName>>
        ]
    )[] = Object.values(APPLICATION_FIELDS_STEP2).map((field) => {
      if (typeof field === 'string') {
        return [
          field,
          {
            name: field,
            label: t(`${translationsBase}.fields.${field}.label`),
            placeholder: t(`${translationsBase}.fields.${field}.placeholder`),
          },
        ];
      }

      const employeeFields: [EMPLOYEE_KEYS, Field<EmployeeFieldName>][] =
        Object.values(field).map((employeeField) => [
          employeeField,
          {
            name: `${APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE}.${employeeField}`,
            label: t(`${translationsBase}.fields.${employeeField}.label`),
            placeholder: t(
              `${translationsBase}.fields.${employeeField}.placeholder`
            ),
          },
        ]);

      const employeeDict = fromPairs(employeeFields) as Record<
        EMPLOYEE_KEYS,
        Field<EmployeeFieldName>
      >;

      return [APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE, employeeDict];
    });

    return fromPairs<Field | Record<EMPLOYEE_KEYS, Field<EmployeeFieldName>>>(
      fieldEntries
    ) as Step2Fields;
  }, [t, translationsBase]);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(errors, touched, fieldName, t, isSubmitted);

  const handleSubmitNext = (): void => {
    setIsSubmitted(true);
    setStep(3);
    void formik.validateForm().then((errs) => {
      let fieldName = Object.keys(errs)[0];

      if (!fieldName) {
        return formik.submitForm();
      }

      if (fieldName === APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE) {
        const employeeFieldKey = Object.keys(errs[fieldName] ?? {})[0];

        fieldName = [
          APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE,
          employeeFieldKey,
        ].join('.');
      }

      return focusAndScroll(fieldName);
    });
  };

  const handleSubmitBack = (): void => {
    setStep(1);
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        applicationStep: getApplicationStepString(1),
      },
      { deep: true }
    );
    updateApplication(currentApplicationData);
  };

  const clearCommissionValues = React.useCallback((): void => {
    void setFieldValue(fields.employee.commissionDescription.name, '');
    void setFieldValue(fields.employee.commissionAmount.name, '');
  }, [
    fields.employee.commissionDescription.name,
    fields.employee.commissionAmount.name,
    setFieldValue,
  ]);

  const clearContractValues = React.useCallback((): void => {
    void setFieldValue(fields.employee.jobTitle.name, '');
    void setFieldValue(fields.employee.workingHours.name, '');
    void setFieldValue(fields.employee.collectiveBargainingAgreement.name, '');
    void setFieldValue(fields.employee.monthlyPay.name, '');
    void setFieldValue(fields.employee.otherExpenses.name, '');
    void setFieldValue(fields.employee.vacationMoney.name, '');
  }, [
    fields.employee.jobTitle.name,
    fields.employee.workingHours.name,
    fields.employee.collectiveBargainingAgreement.name,
    fields.employee.monthlyPay.name,
    fields.employee.otherExpenses.name,
    fields.employee.vacationMoney.name,
    setFieldValue,
  ]);

  const clearDatesValues = React.useCallback((): void => {
    void setFieldValue(fields.startDate.name, '');
    void setFieldValue(fields.endDate.name, '');
  }, [fields.startDate.name, fields.endDate.name, setFieldValue]);

  const clearBenefitValues = React.useCallback((): void => {
    void setFieldValue(fields.benefitType.name, null);
  }, [fields.benefitType.name, setFieldValue]);

  const clearPaySubsidyValues = React.useCallback((): void => {
    void setFieldValue(fields.paySubsidyPercent.name, null);
    void setFieldValue(fields.additionalPaySubsidyPercent.name, null);
    void setFieldValue(fields.apprenticeshipProgram.name, null);
  }, [
    fields.paySubsidyPercent.name,
    fields.additionalPaySubsidyPercent.name,
    fields.apprenticeshipProgram.name,
    setFieldValue,
  ]);

  const minEndDate = getMinEndDate(values.startDate, values.benefitType);
  const minEndDateFormatted = formatDate(minEndDate, DATE_FORMATS.DATE);
  const isEndDateEligible =
    values.endDate && isAfter(parseDate(values.endDate), minEndDate);

  const setEndDate = React.useCallback(() => {
    if (!values.startDate && values.endDate) {
      void setFieldValue(fields.endDate.name, '');
    } else if (values.startDate && !isEndDateEligible) {
      void setFieldValue(fields.endDate.name, minEndDateFormatted);
    }
  }, [
    values.startDate,
    values.endDate,
    fields.endDate.name,
    isEndDateEligible,
    minEndDateFormatted,
    setFieldValue,
  ]);

  const getSelectValue = (fieldName: keyof Application): OptionType | null =>
    subsidyOptions.find(
      (o) => o.value?.toString() === values?.[fieldName]?.toString()
    ) ?? null;

  let language = SUPPORTED_LANGUAGES.FI;
  switch (i18n.language) {
    case SUPPORTED_LANGUAGES.EN:
      language = SUPPORTED_LANGUAGES.EN;
      break;

    case SUPPORTED_LANGUAGES.SV:
      language = SUPPORTED_LANGUAGES.SV;
      break;

    default:
      language = SUPPORTED_LANGUAGES.FI;
      break;
  }

  return {
    t,
    language,
    fields,
    translationsBase,
    formik,
    subsidyOptions,
    minEndDate,
    clearBenefitValues,
    clearCommissionValues,
    clearContractValues,
    clearDatesValues,
    clearPaySubsidyValues,
    getSelectValue,
    getErrorMessage,
    setEndDate,
    handleSubmitNext,
    handleSubmitBack,
  };
};

export { useApplicationFormStep2 };
