import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import useLinkedEventsErrorHandler from 'tet/admin/hooks/backend/useLinkedEventsErrorHandler';
import { LinkedEventsError, TetUpsert } from 'tet-shared/types/linkedevents';

const useUpsertTetPosting = (): UseMutationResult<TetUpsert, AxiosError<LinkedEventsError>, TetUpsert> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleError = useLinkedEventsErrorHandler({
    errorTitle: t('common:api.saveErrorTitle'),
    errorMessage: t('common:api.saveErrorTitle'),
  });

  return useMutation<TetUpsert, AxiosError<LinkedEventsError>, TetUpsert>(
    'upsert',
    ({ id, event }: TetUpsert) =>
      handleResponse<TetUpsert>(
        id
          ? axios.put(`${BackendEndpoint.TET_POSTINGS}${id}/`, event)
          : axios.post(BackendEndpoint.TET_POSTINGS, event),
      ),
    {
      onSuccess: (data, variables) => {
        const successMessage = variables.event.date_published
          ? t('common:publish.saveSuccessMessage')
          : t('common:upload.successMessage');
        void queryClient.removeQueries();
        void router.push('/');
        showSuccessToast(successMessage, '');
      },
      onError: (error) => handleError(error),
    },
  );
};

export default useUpsertTetPosting;
