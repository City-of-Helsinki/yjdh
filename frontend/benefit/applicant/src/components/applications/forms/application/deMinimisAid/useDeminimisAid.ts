import {
  DE_MINIMIS_AID_FIELDS,
  DE_MINIMIS_AID_GRANTED_AT_MAX_DATE,
  SUPPORTED_LANGUAGES,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { DeMinimisAid } from 'benefit/applicant/types/application';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import {
  DATE_FORMATS,
  formatDate,
  isFuture,
  parseDate,
} from 'shared/utils/date.utils';
import { capitalize } from 'shared/utils/string.utils';
import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  language: SUPPORTED_LANGUAGES;
  fieldNames: string[];
  fields: FieldsDef;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string;
  handleSubmit: (e: React.MouseEvent) => void;
  formik: FormikProps<FormFields>;
  grants: DeMinimisAid[];
};

type FieldsDef = {
  [key: string]: Field;
};

type FormFields = {
  [DE_MINIMIS_AID_FIELDS.GRANTER]: string;
  [DE_MINIMIS_AID_FIELDS.AMOUNT]: string;
  [DE_MINIMIS_AID_FIELDS.GRANTED_AT]: string;
};

const useDeminimisAid = (data: DeMinimisAid[]): ExtendedComponentProps => {
  const { t, i18n } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  const { applicationTempData, setApplicationTempData } = React.useContext(
    ApplicationContext
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [defaultValue, setDefaultValue] = useState(false);

  // initial data
  useEffect(() => {
    if (!defaultValue) {
      setApplicationTempData({ ...applicationTempData, deMinimisAids: data });
      setDefaultValue(true);
    }
  }, [
    data,
    defaultValue,
    setDefaultValue,
    applicationTempData,
    setApplicationTempData,
  ]);

  const formik = useFormik({
    initialValues: {
      [DE_MINIMIS_AID_FIELDS.GRANTER]: '',
      [DE_MINIMIS_AID_FIELDS.AMOUNT]: '',
      [DE_MINIMIS_AID_FIELDS.GRANTED_AT]: '',
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
        .typeError(VALIDATION_MESSAGE_KEYS.INVALID)
        .min(0, (param) => ({
          min: param.min,
          key: VALIDATION_MESSAGE_KEYS.NUMBER_MIN,
        })),
      [DE_MINIMIS_AID_FIELDS.GRANTED_AT]: Yup.date()
        .transform((_, original) => parseDate(original, DATE_FORMATS.DATE))
        .typeError(VALIDATION_MESSAGE_KEYS.DATE_FORMAT)
        .test({
          message: t(VALIDATION_MESSAGE_KEYS.DATE_MAX, {
            max: formatDate(
              DE_MINIMIS_AID_GRANTED_AT_MAX_DATE,
              DATE_FORMATS.DATE
            ),
          }),
          test: (value) => {
            if (!value || isFuture(value)) {
              return false;
            }
            return true;
          },
        }),
    }),
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: () => {
      setApplicationTempData({
        ...applicationTempData,
        deMinimisAids: [
          ...(applicationTempData.deMinimisAids || []),
          {
            granter: formik.values[DE_MINIMIS_AID_FIELDS.GRANTER],
            amount: parseFloat(formik.values[DE_MINIMIS_AID_FIELDS.AMOUNT]),
            grantedAt: formatDate(
              parseDate(formik.values[DE_MINIMIS_AID_FIELDS.GRANTED_AT]),
              'yyyy-MM-dd'
            ),
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
      DE_MINIMIS_AID_FIELDS.GRANTED_AT,
    ],
    []
  );

  const fields = React.useMemo((): FieldsDef => {
    const fieldsdef: FieldsDef = {};
    fieldNames.forEach((name) => {
      fieldsdef[name] = {
        name,
        label: t(
          `${translationsBase}.fields.deMinimisAid${capitalize(name)}.label`
        ),
        placeholder: t(
          `${translationsBase}.fields.deMinimisAid${capitalize(
            name
          )}.placeholder`
        ),
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
    fieldNames,
    fields,
    translationsBase,
    formik,
    getErrorMessage,
    handleSubmit,
    grants: applicationTempData.deMinimisAids || [],
  };
};

export { useDeminimisAid };
