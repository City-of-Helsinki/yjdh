import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { LinkedEventsError, TetUpsert } from 'tet/admin/types/linkedevents';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import { useTranslation } from 'next-i18next';
import useLinkedEventsErrorHandler from 'tet/admin/hooks/backend/useLinkedEventsErrorHandler';

const useUpsertTetPosting = (): UseMutationResult<TetUpsert, AxiosError<LinkedEventsError>, TetUpsert> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleError = useLinkedEventsErrorHandler();

  return useMutation<TetUpsert, AxiosError<LinkedEventsError>, TetUpsert>(
    'upsert',
    ({ id, event }: TetUpsert) =>
      handleResponse<TetUpsert>(
        id ? axios.put(`${BackendEndpoint.TET_POSTINGS}${id}`, event) : axios.post(BackendEndpoint.TET_POSTINGS, event),
      ),
    {
      onSuccess: () => {
        void queryClient.removeQueries();
        void router.push('/');
        showSuccessToast(t('common:upload.successMessage'), '');
      },
      onError: (error) => handleError(error),
    },
  );
};

export default useUpsertTetPosting;
