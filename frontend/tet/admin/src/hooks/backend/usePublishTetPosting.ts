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

const usePublishTetPosting = (): UseMutationResult<TetPosting, AxiosError<LinkedEventsError>, TetPosting> => {
  const { t } = useTranslation();
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleError = useLinkedEventsErrorHandler({
    errorTitle: t('common:api.publishErrorTitle'),
    errorMessage: t('common:api.publishErrorMessage'),
  });

  return useMutation<TetPosting, AxiosError<LinkedEventsError>, TetPosting>(
    'delete',
    (posting: TetPosting) =>
      handleResponse<TetPosting>(axios.put(`${BackendEndpoint.TET_POSTINGS}${posting.id}/publish/`)),
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

export default usePublishTetPosting;
