import hdsToast from 'benefit/applicant/components/toast/Toast';
import {
  addressRegex,
  APPLICATION_FIELDS_STEP1,
  cityRegex,
  companyAccRegex,
  namesRegex,
  phoneRegex,
  postalCodeRegex,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
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
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { Field, FieldsDef } from 'shared/components/forms/fields/types';
import { OptionType } from 'shared/types/common';
import snakecaseKeys from 'snakecase-keys';
import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  fieldNames: string[];
  fields: FieldsDef;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmit: () => void;
  erazeDeminimisAids: () => void;
  formik: FormikProps<Application>;
  deMinimisAids: DeMinimisAid[];
  languageOptions: OptionType[];
  getDefaultSelectValue: (fieldName: keyof Application) => OptionType;
};

const useApplicationFormStep1 = (
  application: Application
): ExtendedComponentProps => {
  const { t } = useTranslation();
  const { applicationTempData, setApplicationTempData } = React.useContext(
    ApplicationContext
  );
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
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    if (isApplicationCreated || isApplicationUpdated) {
      setApplicationTempData({
        ...applicationTempData,
        id: applicationTempData.id || newApplication?.id || '',
        currentStep: step,
      });
    }
  }, [
    isApplicationCreated,
    isApplicationUpdated,
    newApplication,
    step,
    applicationTempData,
    setApplicationTempData,
  ]);

  const formik = useFormik({
    initialValues: application || {},
    validationSchema: Yup.object().shape({
      [APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_STREET_ADDRESS]: Yup.string().matches(
        addressRegex,
        t(VALIDATION_MESSAGE_KEYS.ADDRESS_INVALID)
      ),
      [APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_POSTCODE]: Yup.string().matches(
        postalCodeRegex,
        t(VALIDATION_MESSAGE_KEYS.POSTAL_CODE_INVALID)
      ),
      [APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_CITY]: Yup.string().matches(
        cityRegex,
        t(VALIDATION_MESSAGE_KEYS.CITY_INVALID)
      ),
      [APPLICATION_FIELDS_STEP1.COMPANY_BANK_ACCOUNT_NUMBER]: Yup.string().matches(
        companyAccRegex,
        t(VALIDATION_MESSAGE_KEYS.IBAN_INVALID)
      ),
      [APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_PHONE_NUMBER]: Yup.string().matches(
        phoneRegex,
        t(VALIDATION_MESSAGE_KEYS.PHONE_INVALID)
      ),
      [APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_EMAIL]: Yup.string().email(
        t(VALIDATION_MESSAGE_KEYS.EMAIL_INVALID)
      ),
      [APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_FIRST_NAME]: Yup.string().matches(
        namesRegex,
        t(VALIDATION_MESSAGE_KEYS.NAME_INVALID)
      ),
      [APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_LAST_NAME]: Yup.string().matches(
        namesRegex,
        t(VALIDATION_MESSAGE_KEYS.NAME_INVALID)
      ),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: () => {
      setStep(2);
      const currentApplicationData: ApplicationData = snakecaseKeys(
        {
          ...application,
          ...formik.values,
          applicationStep: 'step_1',
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

  const fieldNames = React.useMemo(
    (): string[] => Object.values(APPLICATION_FIELDS_STEP1),
    []
  );

  const fields = React.useMemo((): FieldsDef => {
    const fieldMasks: Record<Field['name'], Field['mask']> = {
      [APPLICATION_FIELDS_STEP1.COMPANY_BANK_ACCOUNT_NUMBER]: {
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

  const handleSubmit = (): void => {
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

  const erazeDeminimisAids = (): void =>
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
    fieldNames,
    fields,
    translationsBase,
    formik,
    getErrorMessage,
    handleSubmit,
    erazeDeminimisAids,
    deMinimisAids: application.deMinimisAidSet || [],
    languageOptions,
    getDefaultSelectValue,
  };
};

export { useApplicationFormStep1 };
