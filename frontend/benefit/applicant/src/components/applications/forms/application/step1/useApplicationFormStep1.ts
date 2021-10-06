import { APPLICATION_FIELDS_STEP1_KEYS } from 'benefit/applicant/constants';
import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application, DeMinimisAid } from 'benefit/applicant/types/application';
import { getLanguageOptions } from 'benefit/applicant/utils/common';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import { OptionType } from 'shared/types/common';
import { focusAndScroll } from 'shared/utils/dom.utils';

import { getValidationSchema } from './utils/validation';

type ExtendedComponentProps = {
  t: TFunction;
  fields: Record<
    APPLICATION_FIELDS_STEP1_KEYS,
    Field<APPLICATION_FIELDS_STEP1_KEYS>
  >;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmit: () => void;
  handleSave: () => void;
  clearDeminimisAids: () => void;
  formik: FormikProps<Application>;
  deMinimisAids: DeMinimisAid[];
  languageOptions: OptionType[];
  getDefaultSelectValue: (fieldName: keyof Application) => OptionType;
};

const useApplicationFormStep1 = (
  application: Application
): ExtendedComponentProps => {
  const { t } = useTranslation();
  const { setDeMinimisAids } = React.useContext(DeMinimisContext);
  const { onNext, onSave } = useFormActions(application, 1);

  const translationsBase = 'common:applications.sections.company';
  // todo: check the isSubmitted logic, when its set to false and how affects the validation message
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: application || {},
    validationSchema: getValidationSchema(t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: onNext,
  });

  const fields: ExtendedComponentProps['fields'] = React.useMemo(() => {
    const fieldMasks: Partial<Record<Field['name'], Field['mask']>> = {
      [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER]: {
        format: 'FI99 9999 9999 9999 99',
        stripVal: (val: string) => val.replace(/\s/g, ''),
      },
    };

    const fieldsValues = Object.values(APPLICATION_FIELDS_STEP1_KEYS);
    const fieldsPairs: [
      APPLICATION_FIELDS_STEP1_KEYS,
      Field<APPLICATION_FIELDS_STEP1_KEYS>
    ][] = fieldsValues.map((fieldName) => [
      fieldName,
      {
        name: fieldName,
        label: t(`${translationsBase}.fields.${fieldName}.label`),
        placeholder: t(`${translationsBase}.fields.${fieldName}.placeholder`),
        mask: fieldMasks[fieldName],
      },
    ]);

    return fromPairs(fieldsPairs) as Record<
      APPLICATION_FIELDS_STEP1_KEYS,
      Field<APPLICATION_FIELDS_STEP1_KEYS>
    >;
  }, [t, translationsBase]);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, isSubmitted);

  const handleSubmit = (): void => {
    setIsSubmitted(true);
    void formik.validateForm().then((errors) => {
      const errorFieldKey = Object.keys(errors)[0];

      if (errorFieldKey) {
        return focusAndScroll(errorFieldKey);
      }

      return formik.submitForm();
    });
  };

  const handleSave = (): void => onSave(formik.values);

  const clearDeminimisAids = (): void => setDeMinimisAids([]);

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'languages'),
    [t]
  );

  const getDefaultSelectValue = (fieldName: keyof Application): OptionType =>
    languageOptions.find(
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
    getErrorMessage,
    handleSubmit,
    handleSave,
    clearDeminimisAids,
    deMinimisAids: application.deMinimisAidSet || [],
    languageOptions,
    getDefaultSelectValue,
  };
};

export { useApplicationFormStep1 };
