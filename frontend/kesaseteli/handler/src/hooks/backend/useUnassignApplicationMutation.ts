import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ApplicationListType, BaseApplication } from '../../types/application';
import invalidateApplicationAssignmentQueries, {
  APPLICATION_ENDPOINT_MAPPING,
} from './invalidateApplicationAssignmentQueries';

type UnassignPayload = { id: string; modified_at?: string };

const useUnassignApplicationMutation = (
  applicationType: ApplicationListType
): UseMutationResult<BaseApplication, Error, UnassignPayload> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UnassignPayload) => {
      const baseEndpoint = APPLICATION_ENDPOINT_MAPPING[applicationType];
      const endpoint = `${baseEndpoint}${payload.id}/unassign/`;
      return handleResponse<BaseApplication>(
        axios.post<BaseApplication>(endpoint, {
          modified_at: payload.modified_at,
        })
      );
    },
    onSuccess: async (_response, variables) => {
      await invalidateApplicationAssignmentQueries(
        queryClient,
        applicationType,
        variables.id
      );
    },
    onError: async (_error, variables) => {
      if (variables?.id) {
        await invalidateApplicationAssignmentQueries(
          queryClient,
          applicationType,
          variables.id
        );
      }
      toast.error(t('common:error.generic'));
    },
  });
};

export default useUnassignApplicationMutation;
