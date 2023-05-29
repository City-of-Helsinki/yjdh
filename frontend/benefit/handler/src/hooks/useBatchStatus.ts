import { AxiosError, AxiosResponse } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  id: string;
  status: BATCH_STATUSES;
};

type Response = {
  status: BATCH_STATUSES;
};

interface BatchErrorResponse extends AxiosResponse {
  status: 400;
  data: {
    errorKey: string;
  };
}

interface BatchError extends AxiosError {
  response: BatchErrorResponse;
}

const useBatchStatus = (): UseMutationResult<Response, BatchError, Payload> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleError = (errorResponse: BatchError): void => {
    if (errorResponse.response?.data?.errorKey) {
      const { errorKey } = errorResponse.response.data;
      showErrorToast(
        t(`common:batches.notifications.errors.${errorKey}.title`),
        t(`common:batches.notifications.errors.${errorKey}.message`)
      );
      return;
    }

    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<Response, BatchError, Payload>(
    'changeBatchStatus',
    ({ id, status }: Payload) => {
      const request = axios.patch<Response>(
        HandlerEndpoint.BATCH_STATUS_CHANGE(id),
        {
          status,
        }
      );
      return handleResponse<Response>(request);
    },
    {
      onSuccess: ({ status: backendStatus }: Response) => {
        setTimeout(() => {
          void queryClient.invalidateQueries('applicationsList');
        }, 25);
        showSuccessToast(
          t(`common:batches.notifications.registerToAhjo.${backendStatus}`),
          ''
        );
      },
      onError: (e: BatchError) => handleError(e),
    }
  );
};

export default useBatchStatus;
