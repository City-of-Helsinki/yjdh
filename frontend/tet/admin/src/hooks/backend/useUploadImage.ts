import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLinkedEventsErrorHandler from 'tet/admin/hooks/backend/useLinkedEventsErrorHandler';
import { LinkedEventsError } from 'tet-shared/types/linkedevents';

const useUploadImage = (): UseMutationResult<File, AxiosError<LinkedEventsError>, File> => {
  const { t } = useTranslation();
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleError = useLinkedEventsErrorHandler({
    errorTitle: t('common:api.publishErrorTitle'),
    errorMessage: t('common:api.publishErrorMessage'),
  });

  return useMutation<File, AxiosError<LinkedEventsError>, File>(
    'postImage',
    () => handleResponse<File>(axios.put(`$`)),
    {
      onSuccess: () => {
        void queryClient.removeQueries();
        void router.push('/');
        showSuccessToast(t('common:publish.successTitle'), '');
      },
      onError: handleError,
    },
  );
};

export default useUploadImage;
