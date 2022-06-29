import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import TetPosting from 'tet-shared/types/tetposting';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import { useTranslation } from 'next-i18next';
import useLinkedEventsErrorHandler from 'tet/admin/hooks/backend/useLinkedEventsErrorHandler';
import { LinkedEventsError } from 'tet-shared/types/linkedevents';
import { ImageObject } from 'tet-shared/types/linkedevents';

const useUploadImage = (): UseMutationResult<File, AxiosError<LinkedEventsError>, File> => {
  const { t } = useTranslation();
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleError = useLinkedEventsErrorHandler({
    errorTitle: t('common:api.publishErrorTitle'),
    errorMessage: t('common:api.publishErrorMessage'),
  });
  const uploadImage = async (image?: File): Promise<ImageObject> => {
    await new Promise((r) => setTimeout(r, 2000));
    return {
      url: 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/media/images/testimage_9gcuSik.png',
      '@id': 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/image/4234/',
    };
  };

  return useMutation<File, AxiosError<LinkedEventsError>, File>(
    'postImage',
    (image: File) => handleResponse<File>(axios.put(`$`)),
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
