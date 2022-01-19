import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import TetPosting from 'tet/admin/types/tetposting';
import { AxiosError } from 'axios';
import { ErrorData } from 'benefit/applicant/types/common';
import { useRouter } from 'next/router';

const useUpsertTetPosting = (): UseMutationResult<TetPosting, AxiosError<ErrorData>, TetPosting> => {
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation<TetPosting, AxiosError<ErrorData>, TetPosting>(
    'upsert',
    (validatedPosting: TetPosting) =>
      handleResponse<TetPosting>(
        validatedPosting.id
          ? axios.put(`${BackendEndpoint.TET_POSTINGS}${validatedPosting.id}`, validatedPosting)
          : axios.post(BackendEndpoint.TET_POSTINGS, validatedPosting),
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
