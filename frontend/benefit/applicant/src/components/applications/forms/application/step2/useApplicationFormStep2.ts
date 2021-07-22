import {
  APPLICATION_FIELDS,
  APPLICATION_FIELDS_STEP2,
  DEFAULT_APPLICATION_FIELDS_STEP2,
  PAY_SUBSIDY_OPTIONS,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { FormFieldsStep2 } from 'benefit/applicant/types/application';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import noop from 'lodash/noop';
import { TFunction } from 'next-i18next';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { FieldsDef, Option } from 'shared/components/forms/fields/types';
import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  fieldNames: string[];
  fields: FieldsDef;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  erazeCommissionFields: (e: ChangeEvent<HTMLInputElement>) => void;
  formik: FormikProps<FormFieldsStep2>;
  subsidyOptions: Option[];
};

const useApplicationFormStep2 = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.employee';
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: DEFAULT_APPLICATION_FIELDS_STEP2,
    validationSchema: Yup.object().shape({
      [APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER]: Yup.string().matches(
        /^FI\d{16}$/,
        t(VALIDATION_MESSAGE_KEYS.IBAN_INVALID)
      ),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    // todo: impoement
    onSubmit: noop,
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setIsSubmitted(true);
    void formik.validateForm().then((errors) => {
      // todo: Focus the first invalid field
      const invalidFields = Object.keys(errors);
      if (invalidFields.length === 0) {
        void formik.submitForm();
      }
      return null;
    });
  };

  const erazeCommissionFields = (e: ChangeEvent<HTMLInputElement>): void => {
    formik.handleChange(e);
    void formik.setFieldValue(
      APPLICATION_FIELDS.EMPLOYEE_COMMISSION_DESCRIPTION,
      ''
    );
    void formik.setFieldValue(
      APPLICATION_FIELDS.EMPLOYEE_COMMISSION_AMOUNT,
      ''
    );
  };

  return {
    t,
    fieldNames,
    fields,
    translationsBase,
    formik,
    getErrorMessage,
    handleSubmit,
    subsidyOptions,
    erazeCommissionFields,
  };
};

export { useApplicationFormStep2 };
