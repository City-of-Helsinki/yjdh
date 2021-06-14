import { DE_MINIMIS_AID_FIELDS } from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
// import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  fieldNames: string[];
  fields: FieldsDef;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmit: (e: React.MouseEvent) => void;
  formik: FormikProps<FormFields>;
};

type FieldsDef = {
  [key: string]: Field;
};

type FormFields = {
  [DE_MINIMIS_AID_FIELDS.GRANTER]: string;
  [DE_MINIMIS_AID_FIELDS.AMOUNT]: number;
  [DE_MINIMIS_AID_FIELDS.ISSUE_DATE]: string;
};

const useComponent = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  const { application, setApplication } = React.useContext(ApplicationContext);
  const [isSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      [DE_MINIMIS_AID_FIELDS.GRANTER]: '',
      [DE_MINIMIS_AID_FIELDS.AMOUNT]: 0,
      [DE_MINIMIS_AID_FIELDS.ISSUE_DATE]: '',
    },
    // Define Yup validation schema
    // validationSchema: Yup.object().shape({
    //  companyOtherAddressStreet: Yup.boolean().required('Please enter..'),
    // }),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: () => {
      setApplication({
        ...application,
        deMinimisAidGrants: [
          ...(application?.deMinimisAidGrants || []),
          {
            deMinimisAidGranter: formik.values[DE_MINIMIS_AID_FIELDS.GRANTER],
            deMinimisAidAmount: formik.values[DE_MINIMIS_AID_FIELDS.AMOUNT],
            deMinimisAidIssueDate:
              formik.values[DE_MINIMIS_AID_FIELDS.ISSUE_DATE],
          },
        ],
      });
      formik.resetForm();
    },
  });

  const fieldNames = React.useMemo(
    (): string[] => [
      DE_MINIMIS_AID_FIELDS.GRANTER,
      DE_MINIMIS_AID_FIELDS.AMOUNT,
      DE_MINIMIS_AID_FIELDS.ISSUE_DATE,
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

  const getErrorMessage = (fieldName: string): string | undefined => {
    // todo: implement error messages
    // (getIn(formik.touched, fieldName) || isSubmitted) &&
    // getIn(formik.errors, fieldName)
    if (isSubmitted && fieldName) {
      return fieldName;
    }
    return '';
  };

  const handleSubmit = (e: React.MouseEvent): void => {
    e.preventDefault();
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
