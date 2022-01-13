import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useGoToPage from 'shared/hooks/useGoToPage';
import TetPosting from 'tet/admin/types/tetposting';
import { AxiosError } from 'axios';
import { ErrorData } from 'benefit/applicant/types/common';

const useUpsertTetPosting = (): UseMutationResult<TetPosting, AxiosError<ErrorData>, TetPosting> => {
  const { axios, handleResponse } = useBackendAPI();
  const goToPage = useGoToPage();
  const queryClient = useQueryClient();
  return useMutation<TetPosting, AxiosError<ErrorData>, TetPosting>(
    'upsert',
    (validatedPosting: TetPosting) =>
      handleResponse<TetPosting>(axios.post(BackendEndpoint.TET_POSTINGS, validatedPosting)),
    {
      onSuccess: () => {
        void queryClient.removeQueries();
        void goToPage('/application');
      },
    },
  );
};

export default useUpsertTetPosting;
