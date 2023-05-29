import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { downloadFile } from 'shared/utils/file.utils';

type BatchID = string;
type ArrayBufferData = string;

const useDownloadBatchFiles = (): UseMutationResult<
  ArrayBufferData,
  Error,
  BatchID
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:batches.notifications.errors.downloadError.title'),
      t('common:batches.notifications.errors.downloadError.message')
    );
  };

  return useMutation<ArrayBufferData, Error, BatchID>(
    'downloadBatchFiles',
    (batchId: BatchID) => {
      const res = axios.get<ArrayBufferData>(
        `${BackendEndpoint.HANDLER_APPLICATIONS}export_applications_in_batch/?batch_id=${batchId}`,
        { responseType: 'arraybuffer' }
      );
      return handleResponse<ArrayBufferData>(res);
    },
    {
      onSuccess: (data) => {
        downloadFile(data, 'csv/pdf');
      },
      onError: () => handleError(),
    }
  );
};

export default useDownloadBatchFiles;
