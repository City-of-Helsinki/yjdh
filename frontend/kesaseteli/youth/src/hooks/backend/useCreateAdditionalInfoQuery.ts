import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getAdditionalInfoQueryKey,
  getYouthApplicationStatusQueryKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { convertFormDataToApplication } from 'kesaseteli-shared/utils/additional-info-form-data.utils';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useGetLanguage from 'shared/hooks/useGetLanguage';

const useCreateAdditionalInfoQuery = (
  applicationId: CreatedYouthApplication['id'],
  options?: UseMutationOptions<unknown, unknown, AdditionalInfoFormData>
): UseMutationResult<unknown, unknown, AdditionalInfoFormData> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};
  const getLanguage = useGetLanguage();
  return useMutation({
    mutationFn: (formData: AdditionalInfoFormData) =>
      handleResponse<CreatedYouthApplication>(
        axios.post(getAdditionalInfoQueryKey(applicationId), {
          ...convertFormDataToApplication(formData),
          language: getLanguage(),
        })
      ),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: [getYouthApplicationStatusQueryKey(applicationId)],
      });
      if (onSuccess) {
        void onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: useErrorHandler(),
    ...restOptions,
  });
};

export default useCreateAdditionalInfoQuery;
