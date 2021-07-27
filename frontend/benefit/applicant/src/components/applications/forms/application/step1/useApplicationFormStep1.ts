import {
  APPLICATION_FIELDS_STEP1,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useCreateApplicationQuery from 'benefit/applicant/hooks/useCreateApplicationQuery';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ApplicationData,
  DeMinimisAid,
} from 'benefit/applicant/types/application';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { Field, FieldsDef } from 'shared/components/forms/fields/types';
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
};

const useApplicationFormStep1 = (
  application: Application
): ExtendedComponentProps => {
  const {
    deMinimisAids,
    setDeMinimisAids,
    setApplicationId,
    setCurrentStep,
    applicationId,
  } = React.useContext(ApplicationContext);
  const {
    mutate: createApplication,
    data: newApplication,
    // todo:
    // error: createApplicationError,
    isSuccess: isApplicationCreated,
  } = useCreateApplicationQuery();

  const {
    mutate: updateApplication,
    // todo:
    // error: updateApplicationError,
    isSuccess: isApplicationUpdated,
  } = useUpdateApplicationQuery();

  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  // todo: check the isSubmitted logic, when its set to false and how affects the validation message
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    if (isApplicationCreated) {
      setApplicationId(newApplication?.id || '');
    }
    setCurrentStep(step);
  }, [
    isApplicationCreated,
    isApplicationUpdated,
    newApplication,
    setApplicationId,
    setCurrentStep,
    step,
  ]);

  const formik = useFormik({
    initialValues: application || {},
    validationSchema: Yup.object().shape({
      [APPLICATION_FIELDS_STEP1.COMPANY_BANK_ACCOUNT_NUMBER]: Yup.string().matches(
        /^FI\d{16}$/,
        t(VALIDATION_MESSAGE_KEYS.IBAN_INVALID)
      ),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: () => {
      setStep(2);
      const currentApplicationData = snakecaseKeys(
        {
          ...application,
          ...formik.values,
          // update from context
          deMinimisAidSet: deMinimisAids,
          deMinimisAid: deMinimisAids?.length !== 0,
        },
        { deep: true }
      ) as ApplicationData;
      if (!applicationId && !application.id) {
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

  const erazeDeminimisAids = (): void => setDeMinimisAids([]);

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
  };
};

export { useApplicationFormStep1 };
