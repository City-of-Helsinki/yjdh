import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

interface Payload {
  appIds?: string[];
  batchId?: string;
}
interface Response {
  remainingApps: number;
}

const useRemoveAppFromBatch = (
  setBatchCloseAnimation: React.Dispatch<React.SetStateAction<boolean>>
): UseMutationResult<Response, Error, Payload> => {
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

  return useMutation<Response, Error, Payload>(
    'removeApplicationFromBatch',
    ({ appIds, batchId }: Payload) =>
      handleResponse<Response>(
        axios.patch<Response>(HandlerEndpoint.BATCH_APP_DEASSIGN(batchId), {
          application_ids: appIds,
        })
      ),
    {
      onSuccess: ({ remainingApps }: Response) => {
        if (remainingApps === 0) {
          setBatchCloseAnimation(true);
          showSuccessToast(
            t(
              'common:batches.notifications.removeFromBatch.success.headingBatchRemoved'
            ),
            ''
          );
          setTimeout(() => {
            void queryClient.invalidateQueries('applicationsList');
          }, 700);
        } else {
          void queryClient.invalidateQueries('applicationsList');
          showSuccessToast(
            t(
              'common:batches.notifications.removeFromBatch.success.headingAppRemoved'
            ),
            ''
          );
        }
      },
      onError: () => handleError(),
    }
  );
};

export default useRemoveAppFromBatch;
