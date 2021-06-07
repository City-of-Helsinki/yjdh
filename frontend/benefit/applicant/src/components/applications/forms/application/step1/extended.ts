import { useTranslation } from 'benefit/applicant/i18n';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { FormEvent, useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
// import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  fieldNames: string[];
  fields: FieldsDef;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  formik: FormikProps<FormFields>;
};

type FieldsDef = {
  [key: string]: Field;
};

type FormFields = {
  hasCompanyOtherAddress: boolean;
  companyOtherAddressStreet: string;
  companyOtherAddressZipCode: string;
  companyOtherAddressPostalDistrict: string;
  companyIban: string;
  contactPersonFirstName: string;
  contactPersonLastName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  deMinimisAidGranted: string;
  collectiveBargainingOngoing: string;
  collectiveBargainingInfo: string;
};

const useComponent = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      hasCompanyOtherAddress: false,
      companyOtherAddressStreet: '',
      companyOtherAddressZipCode: '',
      companyOtherAddressPostalDistrict: '',
      companyIban: '',
      contactPersonFirstName: '',
      contactPersonLastName: '',
      contactPersonPhone: '',
      contactPersonEmail: '',
      deMinimisAidGranted: '',
      collectiveBargainingOngoing: '',
      collectiveBargainingInfo: '',
    },
    // Define Yup validation schema
    // validationSchema: Yup.object().shape({
    //  companyOtherAddressStreet: Yup.boolean().required('Please enter..'),
    // }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {
      // console.log('Form submitted:', values);
    },
  });

  const fieldNames = React.useMemo(
    (): string[] => [
      'hasCompanyOtherAddress',
      'companyOtherAddressStreet',
      'companyOtherAddressZipCode',
      'companyOtherAddressPostalDistrict',
      'companyIban',
      'contactPersonFirstName',
      'contactPersonLastName',
      'contactPersonPhone',
      'contactPersonEmail',
      'deMinimisAidGranted',
      'collectiveBargainingOngoing',
      'collectiveBargainingInfo',
    ],
    []
  );

  const fields = React.useMemo((): FieldsDef => {
    const fieldsdef: FieldsDef = {};
    fieldNames.forEach((name) => {
      fieldsdef[name] = {
        name,
        label: t(`${translationsBase}.fields.${name}.label`),
        placeholder: t(`${translationsBase}.fields.${name}.placeholder`),
      };
    });
    return fieldsdef;
  }, [t, fieldNames]);

  const getErrorMessage = (fieldName: string): string | undefined =>
    // todo: implement error messages
    // (getIn(formik.touched, fieldName) || isSubmitted) &&
    // getIn(formik.errors, fieldName)
    isSubmitted ? fieldName : '';

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

export { useComponent };
