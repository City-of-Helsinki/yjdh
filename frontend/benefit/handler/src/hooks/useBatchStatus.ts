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

const useBatchStatus = (): UseMutationResult<Response, Error, Payload> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<Response, Error, Payload>(
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
        showSuccessToast(
          t(`common:batches.notifications.registerToAhjo.${backendStatus}`),
          ''
        );

        if (backendStatus === BATCH_STATUSES.DRAFT) {
          void queryClient.invalidateQueries('applicationsList');
        }
      },
      onError: () => handleError(),
    }
  );
};

export default useBatchStatus;
