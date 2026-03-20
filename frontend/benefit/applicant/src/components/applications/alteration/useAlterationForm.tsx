import { AxiosError } from 'axios';
import useCreateApplicationAlterationQuery from 'benefit/applicant/hooks/useCreateApplicationAlterationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { getValidationSchema } from 'benefit-shared/components/alterationForm/utils/validation';
import {
  Application,
  ApplicationAlteration,
  ApplicationAlterationData,
} from 'benefit-shared/types/application';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { MutationFunction } from 'react-query';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';
import { convertDateFormat } from 'shared/utils/date.utils';
import snakecaseKeys from 'snakecase-keys';

type Props = {
  application: Application;
  onSuccess: MutationFunction<void, ApplicationAlterationData>;
  onError?: (error: AxiosError<unknown>) => void;
};

type OutProps = {
  t: TFunction;
  formik: FormikProps<ApplicationAlteration>;
  language: Language;
  isSubmitted: boolean;
  handleSubmit: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  error: AxiosError | null;
  isSubmitting: boolean;
};

const useAlterationForm = ({
  application,
  onSuccess,
  onError,
}: Props): OutProps => {
  const { t } = useTranslation();
  const language = useLocale();
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const {
    mutate: createQuery,
    error,
    isLoading,
  } = useCreateApplicationAlterationQuery({
    onSuccess,
  });

  const submitForm = (data: ApplicationAlteration): void => {
    const payload = snakecaseKeys(
      {
        ...data,
        endDate: convertDateFormat(data.endDate),
        resumeDate: convertDateFormat(data.resumeDate) || undefined,
      },
      { deep: true }
    ) as ApplicationAlterationData;

    createQuery(payload);
  };

  const formik = useFormik<ApplicationAlteration>({
    initialValues: {
      application: application.id || '',
      alterationType: undefined,
      endDate: undefined,
      resumeDate: undefined,
      reason: '',
      useEinvoice: false,
      contactPersonName: `${application.companyContactPersonFirstName} ${application.companyContactPersonLastName}`,
      einvoiceProviderName: '',
      einvoiceProviderIdentifier: '',
      einvoiceAddress: '',
    },
    validationSchema: getValidationSchema(application, t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: submitForm,
  });

  const handleSubmit = (e?: React.MouseEvent<HTMLButtonElement>): void => {
    if (e) e.preventDefault();
    setIsSubmitted(true);
    void formik.validateForm().then((errors) => {
      const invalidFields = Object.keys(errors);
      if (invalidFields.length === 0) {
        void formik.submitForm();
      }
      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    });
  };

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  return {
    t,
    formik,
    language,
    isSubmitted,
    isSubmitting: isLoading,
    handleSubmit,
    error,
  };
};

export default useAlterationForm;
