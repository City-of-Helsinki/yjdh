import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type ApplicationID = string;

const useDownloadApplicationPdf = (): UseMutationResult<
  ArrayBuffer,
  Error,
  ApplicationID
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:review.actions.downloadPdfError.title'),
      t('common:review.actions.downloadPdfError.message')
    );
  };

  return useMutation<ArrayBuffer, Error, ApplicationID>(
    'downloadApplicationPdf',
    (applicationId: ApplicationID) => {
      const res = axios.get<ArrayBuffer>(
        HandlerEndpoint.HANDLER_APPLICATION_PDF(applicationId),
        { responseType: 'arraybuffer' }
      );

      return handleResponse<ArrayBuffer>(res);
    },
    {
      onSuccess: (data, applicationId) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hakemus_${applicationId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      onError: () => handleError(),
    }
  );
};

export default useDownloadApplicationPdf;
