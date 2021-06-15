import {
  dateRegex,
  DE_MINIMIS_AID_FIELDS,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import * as Yup from 'yup';

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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      [DE_MINIMIS_AID_FIELDS.GRANTER]: '',
      [DE_MINIMIS_AID_FIELDS.AMOUNT]: 0,
      [DE_MINIMIS_AID_FIELDS.ISSUE_DATE]: '',
    },
    validationSchema: Yup.object().shape({
      [DE_MINIMIS_AID_FIELDS.GRANTER]: Yup.string()
        .required(VALIDATION_MESSAGE_KEYS.REQUIRED)
        .max(64, (param) => ({
          max: param.max,
          key: VALIDATION_MESSAGE_KEYS.STRING_MAX,
        })),
      [DE_MINIMIS_AID_FIELDS.AMOUNT]: Yup.number()
        .required(VALIDATION_MESSAGE_KEYS.REQUIRED)
        .min(0, (param) => ({
          min: param.min,
          key: VALIDATION_MESSAGE_KEYS.NUMBER_MIN,
        })),
      [DE_MINIMIS_AID_FIELDS.ISSUE_DATE]: Yup.string()
        .required(VALIDATION_MESSAGE_KEYS.REQUIRED)
        .matches(dateRegex, VALIDATION_MESSAGE_KEYS.DATE_FORMAT),
    }),
    validateOnChange: true,
    validateOnBlur: false,
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
      setIsSubmitted(false);
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

  const getErrorMessage = (fieldName: string): string =>
    getErrorText(formik.errors, formik.touched, fieldName, t, isSubmitted);

  const handleSubmit = (e: React.MouseEvent): void => {
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
