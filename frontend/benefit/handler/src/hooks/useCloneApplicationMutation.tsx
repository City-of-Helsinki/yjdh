import { AxiosError } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { prettyPrintObject } from 'benefit-shared/utils/errors';
import camelcaseKeys from 'camelcase-keys';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Response = {
  id?: string;
};

const useCloneApplicationMutation = (): UseMutationResult<
  Response,
  unknown,
  string
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  return useMutation(
    'clone_application',
    (id?: string) =>
      handleResponse<Response>(
        axios.get(HandlerEndpoint.HANDLER_APPLICATIONS_CLONE_AS_DRAFT(id))
      ),
    {
      onError: (error: AxiosError) => {
        if (error?.response?.status === 404)
          showErrorToast(
            t('common:applications.errors.cloneError.title'),
            t('common:applications.errors.cloneError.message')
          );
        else {
          const errorData = camelcaseKeys(error.response?.data ?? {});

          const isContentTypeHTML = typeof errorData === 'string';
          const errorString = isContentTypeHTML
            ? t('common:error.generic.text')
            : null;
          if (errorString) {
            showErrorToast('Error cloning application', errorString);
            return;
          }

          const errorElements = Object.entries(errorData).map(([key, value]) =>
            typeof value === 'string' ? (
              <span key={key}>{value}</span>
            ) : (
              prettyPrintObject({
                data: value as Record<string, string[]>,
              })
            )
          );
          showErrorToast('Error cloning application', errorElements);
        }
      },
    }
  );
};

export default useCloneApplicationMutation;
