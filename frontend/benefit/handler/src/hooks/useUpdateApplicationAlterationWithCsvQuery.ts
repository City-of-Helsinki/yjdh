import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useUpdateApplicationAlterationWithCsvQuery = (): UseMutationResult<
  Blob,
  AxiosError<ErrorData>,
  {
    id: string;
    applicationId: string;
    data: Partial<ApplicationAlterationData>;
  }
> => {
  const { axios } = useBackendAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateApplicationAlterationWithCsv'],
    mutationFn: async ({ id, applicationId, data }) => {
      const params = `?application_id=${applicationId}&alteration_id=${id}`;
      const endpoint = `${BackendEndpoint.HANDLER_APPLICATION_ALTERATION_UPDATE_WITH_CSV}${params}`;

      const response = await axios.patch(
        endpoint,
        { ...data },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data instanceof Blob) {
        return response.data;
      }
      throw new Error('Unexpected response type');
    },
    onSuccess: (_, { applicationId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['applications', applicationId],
      });
    },
  });
};

export default useUpdateApplicationAlterationWithCsvQuery;
