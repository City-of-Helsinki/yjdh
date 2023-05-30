import { AxiosError, AxiosResponse } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

interface Payload {
  applicationIds?: string[];
  status?: APPLICATION_STATUSES;
}

interface BatchErrorResponse extends AxiosResponse {
  status: 400;
  data: {
    errorKey: string;
  };
}

interface BatchError extends AxiosError {
  response: BatchErrorResponse;
}

const useAddToBatchQuery = (): UseMutationResult<Payload, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleError = (errorResponse: BatchError): void => {
    if (errorResponse.response?.data?.errorKey) {
      const { errorKey } = errorResponse.response.data;
      showErrorToast(
        t(`common:batches.notifications.errors.${errorKey}.locked.title`),
        t(`common:batches.notifications.errors.${errorKey}.locked.message`)
      );
      return;
    } else {
      showErrorToast(
        t('common:applications.list.errors.fetch.label'),
        t('common:applications.list.errors.fetch.text', { status: 'error' })
      );
    }
  };

  return useMutation<Payload, Error, Payload>(
    'addApplicationToBatch',
    ({ applicationIds, status }: Payload) =>
      handleResponse<Payload>(
        axios.patch<Payload>(`${HandlerEndpoint.BATCH_APP_ASSIGN}`, {
          application_ids: applicationIds,
          status,
        })
      ),
    {
      onSuccess: (_, { applicationIds }) => {
        showSuccessToast(
          t('batches.notifications.addToBatch.success.heading'),
          t('batches.notifications.addToBatch.success.text', {
            count: applicationIds.length,
          })
        );
        void queryClient.invalidateQueries('applicationsList');
      },
      onError: (error: BatchError) => handleError(error),
    }
  );
};

export default useAddToBatchQuery;
