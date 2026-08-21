import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ReviewStateData } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useUpdateReviewStateQuery = (): UseMutationResult<
  ReviewStateData,
  AxiosError<ErrorData>,
  ReviewStateData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<ReviewStateData, AxiosError<ErrorData>, ReviewStateData>({
    mutationKey: ['updateReviewState'],
    mutationFn: (reviewState: ReviewStateData) =>
      handleResponse<ReviewStateData>(
        axios.put(
          `${BackendEndpoint.HANDLER_APPLICATIONS}${reviewState.application}/review/`,
          reviewState
        )
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviewState'] });
    },
  });
};

export default useUpdateReviewStateQuery;
