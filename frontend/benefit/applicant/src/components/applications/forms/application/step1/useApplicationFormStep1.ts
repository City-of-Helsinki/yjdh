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
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { Field, FieldsDef } from 'shared/components/forms/fields/types';
import { IndexType, toCamelKeys, toSnakeKeys } from 'shared/utils/object.utils';
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
};

const useApplicationFormStep1 = (): ExtendedComponentProps => {
  const {
    application,
    setApplication,
    deMinimisAids,
    setDeMinimisAids,
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
    data: updatedApplication,
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
    if (isApplicationCreated || isApplicationUpdated) {
      setApplication({
        ...(toCamelKeys(
          (isApplicationCreated
            ? (newApplication as unknown)
            : (updatedApplication as unknown)) as IndexType
        ) as Application),
        currentStep: step,
      });
    }
  }, [
    isApplicationCreated,
    newApplication,
    isApplicationUpdated,
    updatedApplication,
    setApplication,
    step,
  ]);

  const formik = useFormik({
    initialValues: application,
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
      const currentApplicationData = toSnakeKeys(({
        ...application,
        ...formik.values,
        // update from context
        deMinimisAidSet: deMinimisAids,
        deMinimisAid: deMinimisAids?.length !== 0,
      } as unknown) as IndexType) as ApplicationData;
      if (!application.id) {
        createApplication(currentApplicationData);
      } else {
        updateApplication(currentApplicationData);
      }
    },
  });

  const fieldNames = React.useMemo(
    (): string[] => [
      APPLICATION_FIELDS_STEP1.USE_ALTERNATIVE_ADDRESS,
      APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_STREET_ADDRESS,
      APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_POSTCODE,
      APPLICATION_FIELDS_STEP1.ALTERNATIVE_COMPANY_CITY,
      APPLICATION_FIELDS_STEP1.COMPANY_BANK_ACCOUNT_NUMBER,
      APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_FIRST_NAME,
      APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_LAST_NAME,
      APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_PHONE_NUMBER,
      APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_EMAIL,
      APPLICATION_FIELDS_STEP1.DE_MINIMIS_AID,
      APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS,
      APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS_DESCRIPTION,
    ],
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
  };
};

export { useApplicationFormStep1 };
