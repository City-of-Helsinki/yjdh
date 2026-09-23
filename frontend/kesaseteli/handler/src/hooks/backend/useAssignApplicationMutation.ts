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

type AssignPayload = { id: string; modified_at?: string };

const useAssignApplicationMutation = (
  applicationType: ApplicationListType
): UseMutationResult<BaseApplication, Error, AssignPayload> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: AssignPayload) => {
      const baseEndpoint = APPLICATION_ENDPOINT_MAPPING[applicationType];
      const endpoint = `${baseEndpoint}${payload.id}/assign/`;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: async (error: any, variables) => {
      if (variables?.id) {
        await invalidateApplicationAssignmentQueries(
          queryClient,
          applicationType,
          variables.id
        );
      }
      if (error?.response?.status === 409) {
        toast.error(t('common:application.assignConflict'));
      } else {
        toast.error(t('common:error.generic'));
      }
    },
  });
};

export default useAssignApplicationMutation;
