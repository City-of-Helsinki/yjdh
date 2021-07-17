import {
  APPLICATION_FIELDS,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { FormFieldsStep1 } from 'benefit/applicant/types/application';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import noop from 'lodash/noop';
import { TFunction } from 'next-i18next';
import React, { FormEvent, useState } from 'react';
import { Field, FieldsDef } from 'shared/components/forms/fields/types';
import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  fieldNames: string[];
  fields: FieldsDef;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  formik: FormikProps<FormFieldsStep1>;
};

const useApplicationFormStep1 = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      [APPLICATION_FIELDS.USE_ALTERNATIVE_ADDRESS]: false,
      [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_STREET_ADDRESS]: '',
      [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_POSTCODE]: '',
      [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_CITY]: '',
      [APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER]: '',
      [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_FIRST_NAME]: '',
      [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_LAST_NAME]: '',
      [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]: '',
      [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_EMAIL]: '',
      [APPLICATION_FIELDS.DE_MINIMIS_AID]: '',
      [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS]: '',
      [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]: '',
    },
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
    (): string[] => [
      APPLICATION_FIELDS.USE_ALTERNATIVE_ADDRESS,
      APPLICATION_FIELDS.ALTERNATIVE_COMPANY_STREET_ADDRESS,
      APPLICATION_FIELDS.ALTERNATIVE_COMPANY_POSTCODE,
      APPLICATION_FIELDS.ALTERNATIVE_COMPANY_CITY,
      APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER,
      APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_FIRST_NAME,
      APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_LAST_NAME,
      APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_PHONE_NUMBER,
      APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_EMAIL,
      APPLICATION_FIELDS.DE_MINIMIS_AID,
      APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS,
      APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION,
    ],
    []
  );

  const fields = React.useMemo((): FieldsDef => {
    const fieldMasks: Record<Field['name'], Field['mask']> = {
      [APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER]: {
        format: 'FI99 9999 9999 9999 99',
        stripVal: (val: string) => val.replace(/\s/g, ''),
      },
    };

    return fieldNames.reduce<FieldsDef>(
      (acc, name) => ({
        ...acc,
        [name]: {
          name,
          label: t(`${translationsBase}.fields.${name}.label`),
          placeholder: t(`${translationsBase}.fields.${name}.placeholder`),
          mask: fieldMasks[name],
        },
      }),
      {}
    );
  }, [t, fieldNames]);

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

  return {
    t,
    fieldNames,
    fields,
    translationsBase,
    formik,
    getErrorMessage,
    handleSubmit,
  };
};

export { useApplicationFormStep1 };
