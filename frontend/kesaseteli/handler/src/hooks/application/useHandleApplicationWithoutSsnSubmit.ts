/**
 * TODO: YJDH-701, refactor to reduce code duplication, copied and modified from:
 *       frontend/kesaseteli/youth/src/hooks/useHandleYouthApplicationSubmit.ts
 */
import type { BackendApplicationWithoutSsn } from 'kesaseteli/handler/types/application-without-ssn-types';
import { isApplicationWithoutSsnValidationError } from 'kesaseteli/handler/utils/type-guards';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import isRealIntegrationsEnabled from 'shared/flags/is-real-integrations-enabled';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useGdprMaskedFormValues from 'shared/hooks/useGdprMaskedFormValues';
import useGoToPage from 'shared/hooks/useGoToPage';

type ErrorNotificationType = 'validation_error' | null;

export type SubmitError = {
  type: ErrorNotificationType;
  errorFields: (keyof BackendApplicationWithoutSsn)[];
};

type ReturnType = {
  handleSaveSuccess: (application: CreatedYouthApplication) => void;
  handleErrorResponse: (error: Error | unknown) => void;
  submitError?: SubmitError;
};

const useHandleApplicationWithoutSsnSubmit = (): ReturnType => {
  const goToPage = useGoToPage();
  const handleDefaultError = useErrorHandler();

  const [submitError, setSubmitError] = React.useState<SubmitError | null>(
    null
  );

  const { setError } = useFormContext<BackendApplicationWithoutSsn>();
  const gdprFormValues =
    useGdprMaskedFormValues<BackendApplicationWithoutSsn>();

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
      if (isApplicationWithoutSsnValidationError(error)) {
        const errorFields = Object.keys(
          error.response.data
        ) as (keyof BackendApplicationWithoutSsn)[];

        // eslint-disable-next-line no-console
        console.error(`Application creation failed: validation_error`, {
          gdprFormValues,
          errorFields,
        });
        errorFields.forEach((field) => setError(field, { type: 'pattern' }));
        setSubmitError({ type: 'validation_error', errorFields });
      } else {
        handleDefaultError(error);
      }
    },
    submitError,
  };
};

export default useHandleApplicationWithoutSsnSubmit;
