import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { AxiosError } from 'axios';
import { ErrorData } from 'benefit/applicant/types/common';
import { useRouter } from 'next/router';
import { TetUpsert } from 'tet/admin/types/linkedevents';

const useUpsertTetPosting = (): UseMutationResult<TetUpsert, AxiosError<ErrorData>, TetUpsert> => {
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation<TetUpsert, AxiosError<ErrorData>, TetUpsert>(
    'upsert',
    ({ id, event }: TetUpsert) =>
      handleResponse<TetUpsert>(
        id ? axios.put(`${BackendEndpoint.TET_POSTINGS}${id}`, event) : axios.post(BackendEndpoint.TET_POSTINGS, event),
      ),
    {
      onSuccess: () => {
        void queryClient.removeQueries();
        void router.push('/');
      },
    },
  );
};

export default useUpsertTetPosting;
