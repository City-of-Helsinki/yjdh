import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import TetPosting from 'tet-shared/types/tetposting';
import { AxiosError } from 'axios';
import { ErrorData } from 'benefit/applicant/types/common';
import { useRouter } from 'next/router';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import { useTranslation } from 'next-i18next';

const usePublishTetPosting = (): UseMutationResult<TetPosting, AxiosError<ErrorData>, TetPosting> => {
  const { t } = useTranslation();
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation<TetPosting, AxiosError<ErrorData>, TetPosting>(
    'delete',
    (posting: TetPosting) =>
      handleResponse<TetPosting>(axios.put(`${BackendEndpoint.TET_POSTINGS}${posting.id}/publish/`)),
    {
      onSuccess: () => {
        void queryClient.removeQueries();
        void router.push('/');
        showSuccessToast(t('common:publish.successTitle'), '');
      },
      onError: () => {
        showErrorToast(t('common:publish.errorTitle'), t('common:publish.errorMessage'));
      },
    },
  );
};

export default usePublishTetPosting;
