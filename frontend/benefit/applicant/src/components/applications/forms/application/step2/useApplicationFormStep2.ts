import {
  APPLICATION_FIELDS_STEP2,
  PAY_SUBSIDY_OPTIONS,
  // VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { FieldsDef, Option } from 'shared/components/forms/fields/types';
import { IndexType, toSnakeKeys } from 'shared/utils/object.utils';
import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  fieldNames: string[];
  fields: FieldsDef;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmitBack: () => void;
  handleSubmitNext: () => void;
  erazeCommissionFields: (e: ChangeEvent<HTMLInputElement>) => void;
  formik: FormikProps<Application>;
  subsidyOptions: Option[];
  getDefaultSelectValue: (fieldName: keyof Application) => Option;
};

const useApplicationFormStep2 = (
  application: Application
): ExtendedComponentProps => {
  const { setCurrentStep } = React.useContext(ApplicationContext);
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.employee';
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [step, setStep] = useState<number>(2);

  const {
    mutate: updateApplication,
    // todo:
    // error: updateApplicationError,
    isSuccess: isApplicationUpdated,
  } = useUpdateApplicationQuery();

  useEffect(() => {
    if (isApplicationUpdated) {
      setCurrentStep(step);
    }
  }, [isApplicationUpdated, setCurrentStep, step]);

  const formik = useFormik({
    initialValues: application,
    validationSchema: Yup.object().shape({}),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {
      const currentApplicationData = toSnakeKeys(({
        ...application,
        ...formik.values,
      } as unknown) as IndexType) as ApplicationData;
      updateApplication(currentApplicationData);
    },
  });

  const fieldNames = React.useMemo(
    (): string[] => Object.values(APPLICATION_FIELDS_STEP2),
    []
  );

  const subsidyOptions = React.useMemo(
    (): Option[] =>
      PAY_SUBSIDY_OPTIONS.map((option) => ({
        label: `${option}%`,
        value: option,
      })),
    []
  );

  const fields = React.useMemo(
    (): FieldsDef =>
      fieldNames.reduce<FieldsDef>(
        (acc, name) => ({
          ...acc,
          [name]: {
            name,
            label: t(`${translationsBase}.fields.${name}.label`),
            placeholder: t(`${translationsBase}.fields.${name}.placeholder`),
          },
        }),
        {}
      ),
    [t, fieldNames]
  );

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, isSubmitted);

  const handleSubmit = (nextStep: number): void => {
    setIsSubmitted(true);
    setStep(nextStep);
    void formik.validateForm().then((errors) => {
      // todo: Focus the first invalid field
      const invalidFields = Object.keys(errors);
      if (invalidFields.length === 0) {
        void formik.submitForm();
      }
      return null;
    });
  };

  const handleSubmitNext = (): void => handleSubmit(3);

  const handleSubmitBack = (): void => setCurrentStep(1);

  const erazeCommissionFields = (e: ChangeEvent<HTMLInputElement>): void => {
    formik.handleChange(e);
    void formik.setFieldValue(
      `employee.${APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_DESCRIPTION}`,
      ''
    );
    void formik.setFieldValue(
      `employee.${APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_AMOUNT}`,
      ''
    );
  };

  const getDefaultSelectValue = (fieldName: keyof Application): Option =>
    subsidyOptions.find(
      (o) => o.value === application?.[fieldName]?.toString()
    ) || {
      label: '',
      value: '',
    };

  return {
    t,
    fieldNames,
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
