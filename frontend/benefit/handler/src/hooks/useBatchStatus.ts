import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  batchId: string;
  status: string;
};

const useBatchStatus = (): UseMutationResult<null, Error, Payload> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<null, Error, Payload>(
    'changeBatchStatus',
    ({ batchId, status }: Payload) =>
      handleResponse<null>(
        axios.patch<null>(HandlerEndpoint.BATCH_STATUS_ASSIGN(batchId), {
          status,
        })
      ),
    {
      onSuccess: (_, { status }) => {
        showSuccessToast(
          t(`common:batches.notifications.registerToAhjo.${status}`),
          ''
        );
      },
      onError: () => handleError(),
    }
  );
};

export default useBatchStatus;
