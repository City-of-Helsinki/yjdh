import hdsToast from 'benefit/applicant/components/toast/Toast';
import { APPLICATION_FIELDS_STEP1_KEYS } from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useCreateApplicationQuery from 'benefit/applicant/hooks/useCreateApplicationQuery';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
  DeMinimisAid,
} from 'benefit/applicant/types/application';
import {
  getApplicationStepString,
  getLanguageOptions,
} from 'benefit/applicant/utils/common';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import { OptionType } from 'shared/types/common';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import { focusAndScroll } from 'shared/utils/dom.utils';
import snakecaseKeys from 'snakecase-keys';

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
  const { applicationTempData, setApplicationTempData } =
    React.useContext(ApplicationContext);
  const {
    mutate: createApplication,
    data: newApplication,
    error: createApplicationError,
    isSuccess: isApplicationCreated,
  } = useCreateApplicationQuery();

  const {
    mutate: updateApplication,
    error: updateApplicationError,
    isSuccess: isApplicationUpdated,
  } = useUpdateApplicationQuery();

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationError || createApplicationError) {
      hdsToast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationError, createApplicationError]);

  const translationsBase = 'common:applications.sections.company';
  // todo: check the isSubmitted logic, when its set to false and how affects the validation message
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (isApplicationCreated || isApplicationUpdated) {
      setApplicationTempData({
        ...applicationTempData,
        id: applicationTempData.id || newApplication?.id || '',
      });
    }
  }, [
    isApplicationCreated,
    isApplicationUpdated,
    newApplication,
    applicationTempData,
    setApplicationTempData,
  ]);

  const formik = useFormik({
    initialValues: application || {},
    validationSchema: getValidationSchema(t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values) => {
      const currentApplicationData: ApplicationData = snakecaseKeys(
        {
          ...application,
          ...values,
          startDate: values.startDate
            ? convertToBackendDateFormat(values.startDate)
            : null,
          endDate: values.endDate
            ? convertToBackendDateFormat(values.endDate)
            : null,

          // update from context
          deMinimisAidSet: applicationTempData.deMinimisAids,
          deMinimisAid: applicationTempData.deMinimisAids?.length !== 0,
          applicationStep: getApplicationStepString(2),
        },
        { deep: true }
      );
      if (!applicationTempData.id && !application.id) {
        createApplication(currentApplicationData);
      } else {
        updateApplication(currentApplicationData);
      }
    },
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

  const clearDeminimisAids = (): void =>
    setApplicationTempData({ ...applicationTempData, deMinimisAids: [] });

  const languageOptions = React.useMemo(
    (): OptionType[] => getLanguageOptions(t, 'languages'),
    [t]
  );

  const getDefaultSelectValue = (fieldName: keyof Application): OptionType =>
    languageOptions.find(
      (o: OptionType) => o.value === application?.[fieldName]?.toString()
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
    clearDeminimisAids,
    deMinimisAids: application.deMinimisAidSet || [],
    languageOptions,
    getDefaultSelectValue,
  };
};

export { useApplicationFormStep1 };
