import {
  APPLICATION_FIELDS_STEP2,
  APPLICATION_FIELDS_STEP2_KEYS,
  EMPLOYEE_KEYS,
  MAX_SHORT_STRING_LENGTH,
  PAY_SUBSIDY_OPTIONS,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FinnishSSN } from 'finnish-ssn';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import hdsToast from 'shared/components/toast/Toast';
import { NAMES_REGEX, PHONE_NUMBER_REGEX } from 'shared/constants';
import { OptionType } from 'shared/types/common';
import snakecaseKeys from 'snakecase-keys';
import * as Yup from 'yup';

type Step2Fields = Record<APPLICATION_FIELDS_STEP2_KEYS, Field> &
  Record<APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE, Record<EMPLOYEE_KEYS, Field>>;

type UseApplicationFormStep2Props = {
  t: TFunction;
  fields: Step2Fields;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmitBack: () => void;
  handleSubmitNext: () => void;
  erazeCommissionFields: (e: ChangeEvent<HTMLInputElement>) => void;
  formik: FormikProps<Application>;
  subsidyOptions: OptionType[];
  getDefaultSelectValue: (fieldName: keyof Application) => OptionType;
};

const useApplicationFormStep2 = (
  application: Application
): UseApplicationFormStep2Props => {
  const { t } = useTranslation();
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

  const formik = useFormik({
    initialValues: application,
    validationSchema: Yup.object().shape({
      employee: Yup.object().shape({
        [APPLICATION_FIELDS_STEP2.employee.FIRST_NAME]: Yup.string()
          .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
          .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX)),
        [APPLICATION_FIELDS_STEP2.employee.LAST_NAME]: Yup.string()
          .matches(NAMES_REGEX, t(VALIDATION_MESSAGE_KEYS.INVALID))
          .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX)),
        [APPLICATION_FIELDS_STEP2.employee.PHONE_NUMBER]: Yup.string()
          .matches(PHONE_NUMBER_REGEX, t(VALIDATION_MESSAGE_KEYS.PHONE_INVALID))
          .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX)),
        [APPLICATION_FIELDS_STEP2.employee.SOCIAL_SECURITY_NUMBER]:
          Yup.string().test({
            message: t(VALIDATION_MESSAGE_KEYS.SSN_INVALID),
            test: (val = '') => FinnishSSN.validate(val),
          }),
        [APPLICATION_FIELDS_STEP2.employee.EMPLOYEE_COMMISSION_AMOUNT]:
          Yup.number().nullable().typeError(t(VALIDATION_MESSAGE_KEYS.INVALID)),
        [APPLICATION_FIELDS_STEP2.employee.WORKING_HOURS]: Yup.number()
          .nullable()
          .typeError(t(VALIDATION_MESSAGE_KEYS.INVALID)),
        [APPLICATION_FIELDS_STEP2.employee.VACATION_MONEY]: Yup.number()
          .nullable()
          .typeError(t(VALIDATION_MESSAGE_KEYS.INVALID)),
        [APPLICATION_FIELDS_STEP2.employee.MONTHLY_PAY]: Yup.number()
          .nullable()
          .typeError(t(VALIDATION_MESSAGE_KEYS.INVALID)),
        [APPLICATION_FIELDS_STEP2.employee.OTHER_EXPENSES]: Yup.number()
          .nullable()
          .typeError(t(VALIDATION_MESSAGE_KEYS.INVALID)),
        // .max(MAX_SHORT_STRING_LENGTH, t(VALIDATION_MESSAGE_KEYS.STRING_MAX)),
      }),
    }),
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: () => {
      const currentApplicationData: ApplicationData = snakecaseKeys(
        {
          ...application,
          ...formik.values,
          applicationStep: getApplicationStepString(step),
        },
        { deep: true }
      );
      updateApplication(currentApplicationData);
    },
  });

  const subsidyOptions = React.useMemo(
    (): OptionType[] =>
      PAY_SUBSIDY_OPTIONS.map((option) => ({
        label: `${option}%`,
        value: option,
      })),
    []
  );

  const fields = React.useMemo(() => {
    const fieldEntries: (
      | [APPLICATION_FIELDS_STEP2_KEYS, Field]
      | [APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE, Record<EMPLOYEE_KEYS, Field>]
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

      const employeeFields: [EMPLOYEE_KEYS, Field][] = Object.values(field).map(
        (employeeField) => [
          employeeField,
          {
            name: `${APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE}.${employeeField}`,
            label: t(`${translationsBase}.fields.${employeeField}.label`),
            placeholder: t(
              `${translationsBase}.fields.${employeeField}.placeholder`
            ),
          },
        ]
      );

      const employeeDict = fromPairs(employeeFields) as Record<
        EMPLOYEE_KEYS,
        Field
      >;

      return [APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE, employeeDict];
    });

    return fromPairs<Field | Record<EMPLOYEE_KEYS, Field>>(
      fieldEntries
    ) as Step2Fields;
  }, [t, translationsBase]);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, isSubmitted);

  const handleSubmitNext = (): void => {
    setIsSubmitted(true);
    setStep(3);
    void formik.validateForm().then((errors) => {
      // todo: Focus the first invalid field
      const invalidFields = Object.keys(errors);
      if (invalidFields.length === 0) {
        void formik.submitForm();
      }
      return null;
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

  const erazeCommissionFields = (e: ChangeEvent<HTMLInputElement>): void => {
    formik.handleChange(e);
    void formik.setFieldValue(fields.employee.commissionDescription.name, '');
    void formik.setFieldValue(fields.employee.commissionAmount.name, '');
  };

  const getDefaultSelectValue = (fieldName: keyof Application): OptionType =>
    subsidyOptions.find(
      (o) => o.value === application?.[fieldName]?.toString()
    ) || {
      label: '',
      value: '',
    };

  return {
    t,
    fields,
    translationsBase,
    formik,
    subsidyOptions,
    getDefaultSelectValue,
    getErrorMessage,
    handleSubmitNext,
    handleSubmitBack,
    erazeCommissionFields,
  };
};

export { useApplicationFormStep2 };
