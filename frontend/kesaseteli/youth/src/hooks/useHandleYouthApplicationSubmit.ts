import {
  isYouthApplicationCreationError,
  isYouthApplicationValidationError,
} from 'kesaseteli/youth/utils/type-guards';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import YouthFormFields from 'kesaseteli-shared/types/youth-form-fields';
import { collectErrorFieldsFromResponse } from 'kesaseteli-shared/utils/youth-form-data.utils';
import { useRouter } from 'next/router';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import isRealIntegrationsEnabled from 'shared/flags/is-real-integrations-enabled';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useGdprMaskedFormValues from 'shared/hooks/useGdprMaskedFormValues';
import useGoToPage from 'shared/hooks/useGoToPage';
import useLocale from 'shared/hooks/useLocale';
import { assertUnreachable } from 'shared/utils/typescript.utils';

type ErrorNotificationType = 'please_recheck_data' | 'validation_error' | null;

export type SubmitError = {
  type: ErrorNotificationType;
  errorFields: YouthFormFields[];
};

type ReturnType = {
  handleSaveSuccess: (application: CreatedYouthApplication) => void;
  handleErrorResponse: (error: Error | unknown) => void;
  submitError?: SubmitError;
};

const useHandleYouthApplicationSubmit = (): ReturnType => {
  const router = useRouter();
  const locale = useLocale();
  const goToPage = useGoToPage();
  const handleDefaultError = useErrorHandler();

  const [submitError, setSubmitError] = React.useState<SubmitError | null>(
    null
  );

  const { formState, setError, getValues, reset } =
    useFormContext<YouthFormData>();
  const gdprFormValues = useGdprMaskedFormValues<YouthFormData>();
  const is_unlisted_school = getValues('is_unlisted_school');

  if (
    formState.isDirty &&
    !formState.isSubmitted &&
    submitError?.type === 'please_recheck_data'
  ) {
    setSubmitError(null);
  }

  return {
    handleSaveSuccess: (application: CreatedYouthApplication): void => {
      setSubmitError(null);
      const url =
        isRealIntegrationsEnabled() || !application.id
          ? '/thankyou'
          : `/thankyou?id=${application.id}`;
      goToPage(url);
    },
    handleErrorResponse: (error: Error | unknown): void => {
      if (isYouthApplicationCreationError(error)) {
        const errorCode = error.response.data.code;
        switch (errorCode) {
          case 'already_assigned':
          case 'email_in_use':
          case 'inadmissible_data':
            setSubmitError(null);
            // eslint-disable-next-line no-console
            console.log(
              `Application creation failed: ${error.response.data.code}`,
              gdprFormValues
            );
            void router.push(`${locale}/${encodeURIComponent(errorCode)}`);
            return;

          case 'please_recheck_data':
            // eslint-disable-next-line no-console
            console.log(
              `Application creation failed: ${error.response.data.code}`,
              gdprFormValues
            );
            reset(getValues());
            setSubmitError({ type: 'please_recheck_data', errorFields: [] });
            return;

          default:
            assertUnreachable(errorCode);
        }
      } else if (isYouthApplicationValidationError(error)) {
        const errorFields = collectErrorFieldsFromResponse(
          error.response.data,
          is_unlisted_school
        );
        // eslint-disable-next-line no-console
        console.log(
          `Application creation failed: validation_error`,
          gdprFormValues,
          errorFields
        );
        errorFields.forEach((field) => setError(field, { type: 'pattern' }));
        setSubmitError({ type: 'validation_error', errorFields });
      } else {
        handleDefaultError(error);
      }
    },
    submitError,
  };
};

export default useHandleYouthApplicationSubmit;
