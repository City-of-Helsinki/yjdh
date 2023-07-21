import { AxiosError } from 'axios';
import { ReviewStateData } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useUpdateReviewStateQuery = (): UseMutationResult<
  ReviewStateData,
  AxiosError<ErrorData>,
  ReviewStateData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<ReviewStateData, AxiosError<ErrorData>, ReviewStateData>(
    'updateReviewState',
    (reviewState: ReviewStateData) =>
      handleResponse<ReviewStateData>(
        axios.put(
          `${BackendEndpoint.HANDLER_APPLICATIONS}${reviewState.id}/review/`,
          reviewState
        )
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('reviewState');
      },
    }
  );
};

export default useUpdateReviewStateQuery;
