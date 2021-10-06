import {
  DE_MINIMIS_AID_KEYS,
  SUPPORTED_LANGUAGES,
} from 'benefit/applicant/constants';
import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { DeMinimisAid } from 'benefit/applicant/types/application';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import { capitalize } from 'shared/utils/string.utils';

import { getValidationSchema } from './utils/validation';

type UseDeminimisAidProps = {
  t: TFunction;
  language: SUPPORTED_LANGUAGES;
  fields: { [key in DE_MINIMIS_AID_KEYS]: Field<DE_MINIMIS_AID_KEYS> };
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string;
  handleSubmit: (e: React.MouseEvent) => void;
  formik: FormikProps<FormFields>;
  grants: DeMinimisAid[];
};

type FormFields = {
  [DE_MINIMIS_AID_KEYS.GRANTER]: string;
  [DE_MINIMIS_AID_KEYS.AMOUNT]: string;
  [DE_MINIMIS_AID_KEYS.GRANTED_AT]: string;
};

const useDeminimisAid = (data: DeMinimisAid[]): UseDeminimisAidProps => {
  const { t, i18n } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  const { deMinimisAids, setDeMinimisAids } =
    React.useContext(DeMinimisContext);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [defaultValue, setDefaultValue] = useState(false);

  // initial data
  useEffect(() => {
    if (!defaultValue) {
      setDeMinimisAids(data);
      setDefaultValue(true);
    }
  }, [data, defaultValue, setDefaultValue, setDeMinimisAids]);

  const formik = useFormik({
    initialValues: {
      [DE_MINIMIS_AID_KEYS.GRANTER]: '',
      [DE_MINIMIS_AID_KEYS.AMOUNT]: '',
      [DE_MINIMIS_AID_KEYS.GRANTED_AT]: '',
    },
    validationSchema: getValidationSchema(t),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {
      setDeMinimisAids((prevDeMinimisAids) => [
        ...prevDeMinimisAids,
        {
          [DE_MINIMIS_AID_KEYS.GRANTER]: formik.values.granter,
          [DE_MINIMIS_AID_KEYS.AMOUNT]: parseFloat(formik.values.amount),
          [DE_MINIMIS_AID_KEYS.GRANTED_AT]: convertToBackendDateFormat(
            formik.values.grantedAt
          ),
        },
      ]);
      formik.resetForm();
      setIsSubmitted(false);
    },
  });

  const fields: UseDeminimisAidProps['fields'] = React.useMemo(() => {
    const pairs = Object.values(DE_MINIMIS_AID_KEYS).map<
      [DE_MINIMIS_AID_KEYS, Field<DE_MINIMIS_AID_KEYS>]
    >((fieldName) => [
      fieldName,
      {
        name: fieldName,
        label: t(
          `${translationsBase}.fields.deMinimisAid${capitalize(
            fieldName
          )}.label`
        ),
        placeholder: t(
          `${translationsBase}.fields.deMinimisAid${capitalize(
            fieldName
          )}.placeholder`
        ),
      },
    ]);

    return fromPairs<Field<DE_MINIMIS_AID_KEYS>>(pairs) as Record<
      DE_MINIMIS_AID_KEYS,
      Field<DE_MINIMIS_AID_KEYS>
    >;
  }, [t, translationsBase]);

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
    fields,
    translationsBase,
    formik,
    getErrorMessage,
    handleSubmit,
    grants: deMinimisAids,
  };
};

export { useDeminimisAid };
