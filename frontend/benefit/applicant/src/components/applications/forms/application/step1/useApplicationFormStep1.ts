import {
  APPLICATION_FIELDS,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useCreateApplicationQuery from 'benefit/applicant/hooks/useCreateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  ApplicationData,
  FormFieldsStep1,
} from 'benefit/applicant/types/application';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { Field, FieldsDef } from 'shared/components/forms/fields/types';
import { IndexType, toSnakeKeys } from 'shared/utils/object.utils';
import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  fieldNames: string[];
  fields: FieldsDef;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmitNext: () => void;
  handleSubmitBack: () => void;
  erazeDeminimisAids: () => void;
  formik: FormikProps<FormFieldsStep1>;
};

const useApplicationFormStep1 = (): ExtendedComponentProps => {
  const {
    application,
    setApplication,
    currentStep,
    setCurrentStep,
  } = React.useContext(ApplicationContext);
  const {
    mutate: createApplication,
    // todo:
    // error: createApplicationError,
    isSuccess: isApplicationCreated,
  } = useCreateApplicationQuery();

  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  // todo: check the isSubmitted logic, when its set to false and how affects the validation message
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  // used for changing the step on create/update callback
  const [nextStep, setNextStep] = useState<number>(1);

  useEffect(() => {
    if (isApplicationCreated) {
      setCurrentStep(nextStep);
    }
  }, [isApplicationCreated, setCurrentStep, nextStep]);

  const fieldNames = React.useMemo(
    (): string[] => [
      APPLICATION_FIELDS.USE_ALTERNATIVE_ADDRESS,
      APPLICATION_FIELDS.ALTERNATIVE_COMPANY_STREET_ADDRESS,
      APPLICATION_FIELDS.ALTERNATIVE_COMPANY_POSTCODE,
      APPLICATION_FIELDS.ALTERNATIVE_COMPANY_CITY,
      APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER,
      APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_FIRST_NAME,
      APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_LAST_NAME,
      APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_PHONE_NUMBER,
      APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_EMAIL,
      APPLICATION_FIELDS.DE_MINIMIS_AID,
      APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS,
      APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION,
    ],
    []
  );

  const formik = useFormik({
    initialValues: {
      [APPLICATION_FIELDS.USE_ALTERNATIVE_ADDRESS]: Boolean(
        application?.useAlternativeAddress
      ),
      [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_STREET_ADDRESS]:
        application?.alternativeCompanyStreetAddress || '',
      [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_POSTCODE]:
        application?.alternativeCompanyPostcode || '',
      [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_CITY]:
        application?.alternativeCompanyCity || '',
      [APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER]:
        application?.companyBankAccountNumber || '',
      [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_FIRST_NAME]:
        application?.companyContactPersonFirstName || '',
      [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_LAST_NAME]:
        application?.companyContactPersonLastName || '',
      [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]:
        application?.companyContactPersonPhoneNumber || '',
      [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_EMAIL]:
        application?.companyContactPersonEmail || '',
      [APPLICATION_FIELDS.DE_MINIMIS_AID]: application?.deMinimisAid || '',
      [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS]:
        application?.coOperationNegotiations || '',
      [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]:
        application?.coOperationNegotiationsDescription || '',
    },
    validationSchema: Yup.object().shape({
      [APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER]: Yup.string().matches(
        /^FI\d{16}$/,
        t(VALIDATION_MESSAGE_KEYS.IBAN_INVALID)
      ),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: () => {
      const currentApplicationData = toSnakeKeys(({
        ...application,
        ...{
          ...formik.values,
          // normalize boolean values values:
          [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS]:
            formik.values[APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS] ===
            'true',
          [APPLICATION_FIELDS.DE_MINIMIS_AID]:
            formik.values[APPLICATION_FIELDS.DE_MINIMIS_AID] === 'true',
        },
      } as unknown) as IndexType) as ApplicationData;
      if (!application.id) {
        // console.log('application', currentApplicationData);
        createApplication(currentApplicationData);
      } else {
        // todo: update application
      }
    },
  });

  const fields = React.useMemo((): FieldsDef => {
    const fieldMasks: Record<Field['name'], Field['mask']> = {
      [APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER]: {
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

  const handleSubmit = (step: number): void => {
    setIsSubmitted(true);
    setNextStep(step);
    void formik.validateForm().then((errors) => {
      // todo: Focus the first invalid field
      const invalidFields = Object.keys(errors);
      if (invalidFields.length === 0) {
        void formik.submitForm();
      }
      return null;
    });
  };

  const handleSubmitNext = (): void => handleSubmit(currentStep + 1);

  const handleSubmitBack = (): void => handleSubmit(currentStep - 1);

  const erazeDeminimisAids = (): void =>
    setApplication({ ...application, deMinimisAidSet: [] });

  return {
    t,
    fieldNames,
    fields,
    translationsBase,
    formik,
    getErrorMessage,
    handleSubmitNext,
    handleSubmitBack,
    erazeDeminimisAids,
  };
};

export { useApplicationFormStep1 };
