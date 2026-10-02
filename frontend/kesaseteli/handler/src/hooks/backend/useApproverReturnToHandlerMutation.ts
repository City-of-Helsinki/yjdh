import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ApproverBulkActionResult } from '../../types/application';

type UseApproverReturnToHandlerMutationParams = {
  onSuccess?: () => void;
};

const useApproverReturnToHandlerMutation = (
  params?: UseApproverReturnToHandlerMutationParams
): UseMutationResult<ApproverBulkActionResult, Error, string[]> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (applicationIds: string[]) =>
      handleResponse<ApproverBulkActionResult>(
        axios.post<ApproverBulkActionResult>(
          `${BackendEndpoint.EMPLOYER_APPLICATIONS}return_to_handler_queue/`,
          { application_ids: applicationIds }
        )
      ),
    onSuccess: (data) => {
      if (data.successful_ids.length > 0) {
        toast.success(
          t('common:applicationList.bulkReturnToHandlerSuccess', {
            count: data.successful_ids.length,
          })
        );
      }
      if (data.failed_ids.length > 0) {
        toast.warning(
          t('common:applicationList.bulkReturnToHandlerFailed', {
            count: data.failed_ids.length,
          })
        );
      }
      params?.onSuccess?.();
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 400) {
        const data = error.response.data as
          | { application_ids?: string | string[] }
          | undefined;
        const message = data?.application_ids;
        if (message) {
          toast.error(Array.isArray(message) ? message.join(' ') : message);
          return;
        }
      }
      toast.error(t('common:error.generic.label'));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [BackendEndpoint.EMPLOYER_APPLICATIONS],
      });
    },
  });
};

export default useApproverReturnToHandlerMutation;
