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
    'delete',
    (posting: TetPosting) => handleResponse<TetPosting>(axios.delete(`${BackendEndpoint.TET_POSTINGS}/${posting.id}`)),
    {
      onSuccess: () => {
        void queryClient.removeQueries();
        void router.push('/');
      },
    },
  );
};

export default useUpsertTetPosting;
