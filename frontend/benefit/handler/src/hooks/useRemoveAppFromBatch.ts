import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

interface Payload {
  appIds?: string[];
  batchId?: string;
}

const useRemoveAppFromBatch = (): UseMutationResult<Payload, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<Payload, Error, Payload>(
    'removeApplicationFromBatch',
    ({ appIds, batchId }: Payload) =>
      handleResponse<Payload>(
        axios.patch<Payload>(HandlerEndpoint.BATCH_APP_DEASSIGN(batchId), {
          application_ids: appIds,
        })
      ),
    {
      onSuccess: () => {},
      onError: () => handleError(),
    }
  );
};

export default useRemoveAppFromBatch;
