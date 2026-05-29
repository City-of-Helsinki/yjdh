import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import { useTranslation } from 'benefit/applicant/i18n';
import { getLanguageOptions } from 'benefit/applicant/utils/common';
import {
  APPLICATION_FIELDS_STEP1_KEYS,
  ORGANIZATION_TYPES,
} from 'benefit-shared/constants';
import { Application, ApplicationData, DeMinimisAid } from 'benefit-shared/types/application';
import { getErrorText } from 'benefit-shared/utils/forms';
import { FormikProps, FormikValues, useFormik } from 'formik';
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
  handleQuietSave: () => Promise<void>;
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
    mask?: { format: string; stripVal(val: string): string };
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
  organizationType: ORGANIZATION_TYPES | undefined
): boolean =>
  hasBusinessActivities === true ||
  organizationType === ORGANIZATION_TYPES.COMPANY;

const createFormFields = (
  t: TFunction,
  translationsBase: string
): Record<
  APPLICATION_FIELDS_STEP1_KEYS,
  Field<APPLICATION_FIELDS_STEP1_KEYS>
> => {
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
};

const useFormikInstance = (
  application: Partial<Application>,
  organizationType: ORGANIZATION_TYPES | undefined,
  t: TFunction,
  onNext: (values: Application) => Promise<ApplicationData | void>,
  setDeMinimisAids: (aids: DeMinimisAid[]) => void
): FormikProps<Partial<Application>> => {
  const [initialValues, setInitialValues] = useState(application);
  const isDirtyRef = React.useRef(false);

  const onNextCallback = (values: FormikValues): Promise<void> =>
    onNext(values as Application).then((submitOk): void => {
      if (submitOk) setDeMinimisAids([]);
      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    });

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(organizationType, t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: false,
    onSubmit: onNextCallback,
  });

  // Track dirty state in a ref
  React.useEffect(() => {
    isDirtyRef.current = formik.dirty;
  }, [formik.dirty]);

  // Update form values intelligently
  React.useEffect(() => {
    if (!isDirtyRef.current) {
      setInitialValues(application);
      formik.resetForm({ values: application });
      return;
    }

    if (application.attachments !== formik.values.attachments) {
      formik
        .setFieldValue('attachments', application.attachments)
        .catch((error) => {
          console.error('Failed to update attachments:', error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application]);

  return formik;
};

const useValidationHandlers = (
  formik: FormikProps<Partial<Application>>,
  isUnfinishedDeminimisAid: boolean,
  translationsBase: string,
  t: TFunction,
  setIsSubmitted: (value: boolean) => void
): {
  checkDeMinimisError: () => boolean;
  validateAndSubmit: () => Promise<void>;
} => {
  const checkDeMinimisError = React.useCallback(
    (): boolean =>
      shouldDisplayDeMinimisError(
        isUnfinishedDeminimisAid,
        translationsBase,
        t
      ),
    [isUnfinishedDeminimisAid, translationsBase, t]
  );

  const focusOnFirstError = React.useCallback(
    (errorFieldKey?: string): void => {
      focusAndScroll(errorFieldKey || 'deMinimisAid');
    },
    []
  );

  const hasValidationErrors = React.useCallback(async (): Promise<boolean> => {
    const errs = await formik.validateForm();
    const errorFieldKey = Object.keys(errs)[0];
    const hasDeMinimisError = checkDeMinimisError();

    if (!errorFieldKey && !hasDeMinimisError) {
      return false;
    }

    focusOnFirstError(errorFieldKey);
    return true;
  }, [formik, checkDeMinimisError, focusOnFirstError]);

  const validateAndSubmit = React.useCallback(async (): Promise<void> => {
    setIsSubmitted(true);

    const hasErrors = await hasValidationErrors();
    if (hasErrors) {
      return;
    }

    await formik.validateForm();
    await formik.submitForm();
  }, [formik, hasValidationErrors, setIsSubmitted]);

  return { checkDeMinimisError, validateAndSubmit };
};

const useApplicationFormStep1 = (
  application: Partial<Application>,
  isUnfinishedDeminimisAid: boolean
): ExtendedComponentProps => {
  const { t } = useTranslation();
  const { setDeMinimisAids } = React.useContext(DeMinimisContext);
  const { onNext, onSave, onQuietSave, onDelete } = useFormActions(application);
  const locale = useLocale();
  const translationsBase = 'common:applications.sections.company';
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { data } = useCompanyQuery();
  const organizationType = data?.organization_type;

  const formik = useFormikInstance(
    application,
    organizationType,
    t,
    onNext,
    setDeMinimisAids
  );

  const { values, touched, errors, setFieldValue } = formik;

  const fields = React.useMemo(
    () => createFormFields(t, translationsBase),
    [t, translationsBase]
  );

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(errors, touched, fieldName, t, isSubmitted);

  const { checkDeMinimisError, validateAndSubmit } = useValidationHandlers(
    formik,
    isUnfinishedDeminimisAid,
    translationsBase,
    t,
    setIsSubmitted
  );

  const handleSubmit = (): void => {
    void validateAndSubmit();
  };

  const canSaveApplication = React.useCallback(
    (): boolean => !checkDeMinimisError(),
    [checkDeMinimisError]
  );

  const handleSave = React.useCallback(
    (): void | boolean => (canSaveApplication() ? void onSave(values) : false),
    [canSaveApplication, onSave, values]
  );

  const handleQuietSave = React.useCallback(async (): Promise<void> => {
    await onQuietSave(values);
  }, [onQuietSave, values]);

  const applicationId = values?.id ? String(values.id) : undefined;
  const handleDelete = applicationId
    ? (): void => {
        void onDelete(applicationId);
      }
    : undefined;

  const clearDeminimisAids = React.useCallback((): void => {
    setDeMinimisAids([]);
    setFieldValue(APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID, null);
  }, [setDeMinimisAids, setFieldValue]);

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
    handleQuietSave,
    handleDelete,
    clearDeminimisAids,
    deMinimisAidSet: application.deMinimisAidSet || [],
    languageOptions,
    getDefaultLanguage,
  };
};

export { useApplicationFormStep1 };
