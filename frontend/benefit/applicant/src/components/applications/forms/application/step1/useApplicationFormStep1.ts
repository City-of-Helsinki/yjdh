import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import { useTranslation } from 'benefit/applicant/i18n';
import { getLanguageOptions } from 'benefit/applicant/utils/common';
import { getErrorText } from 'benefit/applicant/utils/forms';
import {
  APPLICATION_FIELDS_STEP1_KEYS,
  ORGANIZATION_TYPES,
} from 'benefit-shared/constants';
import { Application, DeMinimisAid } from 'benefit-shared/types/application';
import { FormikErrors, FormikProps, FormikValues, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useLocale from 'shared/hooks/useLocale';
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
  showDeminimisSection: boolean;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmit: () => void;
  handleSave: () => void;
  handleDelete?: () => void;
  clearDeminimisAids: () => void;
  formik: FormikProps<Partial<Application>>;
  deMinimisAidSet: DeMinimisAid[];
  languageOptions: OptionType[];
  getDefaultLanguage: () => OptionType;
};

const mapFieldValues = (
  fieldName: APPLICATION_FIELDS_STEP1_KEYS,
  t: TFunction,
  translationsBase: string,
  fieldMasks: Partial<
    Record<string, { format: string; stripVal(val: string): string }>
  >
): [
  APPLICATION_FIELDS_STEP1_KEYS,
  {
    name: APPLICATION_FIELDS_STEP1_KEYS;
    label: string;
    placeholder: string;
    mask: { format: string; stripVal(val: string): string };
  }
] => [
  fieldName,
  {
    name: fieldName,
    label: t(`${translationsBase}.fields.${fieldName}.label`),
    placeholder: t(`${translationsBase}.fields.${fieldName}.placeholder`),
    mask: fieldMasks[fieldName],
  },
];

const shouldDisplayDeMinimisError = (
  isUnfinishedDeminimisAid: boolean,
  translationsBase: string,
  t: TFunction
): boolean => {
  if (isUnfinishedDeminimisAid) {
    void showErrorToast(
      t(`${translationsBase}.notifications.deMinimisUnfinished.label`),
      t(`${translationsBase}.notifications.deMinimisUnfinished.content`)
    );
  }
  return isUnfinishedDeminimisAid;
};

const hasBusinessActivitiesOrIsCompany = (
  hasBusinessActivities: boolean,
  organizationType: ORGANIZATION_TYPES
): boolean =>
  hasBusinessActivities === true ||
  organizationType === ORGANIZATION_TYPES.COMPANY;

const useApplicationFormStep1 = (
  application: Partial<Application>,
  isUnfinishedDeminimisAid: boolean
): ExtendedComponentProps => {
  const { t } = useTranslation();
  const { setDeMinimisAids } = React.useContext(DeMinimisContext);
  const { onNext, onSave, onDelete } = useFormActions(application);

  const locale = useLocale();
  const translationsBase = 'common:applications.sections.company';
  // todo: check the isSubmitted logic, when its set to false and how affects the validation message
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { data } = useCompanyQuery();
  const organizationType = data?.organization_type;

  const onNextCallback = (values: FormikValues): Promise<void> =>
    onNext(values).then((submitOk): Promise<void> => {
      // Make sure context is cleared
      if (submitOk) setDeMinimisAids([]);
      return null;
    });

  const formik = useFormik({
    initialValues: application,
    validationSchema: getValidationSchema(organizationType, t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: onNextCallback,
  });

  const { values, touched, errors, setFieldValue } = formik;

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
    ][] = fieldsValues.map((fieldName) =>
      mapFieldValues(fieldName, t, translationsBase, fieldMasks)
    );

    return fromPairs(fieldsPairs) as Record<
      APPLICATION_FIELDS_STEP1_KEYS,
      Field<APPLICATION_FIELDS_STEP1_KEYS>
    >;
  }, [t, translationsBase]);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(errors, touched, fieldName, t, isSubmitted);

  const checkForFieldValidity = (errs: FormikErrors<Application>): boolean => {
    const errorFieldKey = Object.keys(errs)[0];

    if (
      errorFieldKey ||
      shouldDisplayDeMinimisError(isUnfinishedDeminimisAid, translationsBase, t)
    ) {
      focusAndScroll(errorFieldKey || 'deMinimisAid');
      return false;
    }

    void formik.validateForm();
    return true;
  };

  const submitIfFormValid = (isFormValid: boolean): boolean => {
    if (isFormValid) {
      void formik.submitForm();
      return true;
    }
    return false;
  };

  const handleSubmit = (): void => {
    setIsSubmitted(true);
    void formik
      .validateForm()
      .then((errs) => checkForFieldValidity(errs))
      .then((isFormValid: boolean) => submitIfFormValid(isFormValid));
  };

  const handleSave = (): void | boolean =>
    shouldDisplayDeMinimisError(isUnfinishedDeminimisAid, translationsBase, t)
      ? false
      : void onSave(values);

  const applicationId = String(values?.id);
  const handleDelete = applicationId
    ? () => {
        void onDelete(applicationId);
      }
    : undefined;

  const clearDeminimisAids = React.useCallback((): void => {
    setDeMinimisAids([]);
    void setFieldValue(fields.deMinimisAid.name, null);
  }, [fields.deMinimisAid.name, setDeMinimisAids, setFieldValue]);

  const showDeminimisSection = hasBusinessActivitiesOrIsCompany(
    Boolean(values.associationHasBusinessActivities),
    organizationType
  );

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'languages'),
    [t]
  );

  const localeObject = {
    label: t(`common:languages.${locale}`),
    value: locale,
  };

  const getDefaultLanguage = (): OptionType =>
    languageOptions.find(
      (o) =>
        o.value ===
        String(application?.[APPLICATION_FIELDS_STEP1_KEYS.APPLICANT_LANGUAGE])
    ) || localeObject;

  return {
    t,
    fields,
    translationsBase,
    formik,
    showDeminimisSection,
    getErrorMessage,
    handleSubmit,
    handleSave,
    handleDelete,
    clearDeminimisAids,
    deMinimisAidSet: application.deMinimisAidSet || [],
    languageOptions,
    getDefaultLanguage,
  };
};

export { useApplicationFormStep1 };
