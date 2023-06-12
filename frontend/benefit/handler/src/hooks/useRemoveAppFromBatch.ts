import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

interface Payload {
  appIds?: string[];
  batchId?: string;
}

const useRemoveAppFromBatch = (
  setBatchCloseAnimation: React.Dispatch<React.SetStateAction<boolean>>
): UseMutationResult<Payload, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleError = (): void => {
    setBatchCloseAnimation(false);
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
      onSuccess: () => {
        setBatchCloseAnimation(true);
        setTimeout(() => {
          void queryClient.invalidateQueries('applicationsList');
        }, 700);
      },
      onError: () => handleError(),
    }
  );
};

export default useRemoveAppFromBatch;
