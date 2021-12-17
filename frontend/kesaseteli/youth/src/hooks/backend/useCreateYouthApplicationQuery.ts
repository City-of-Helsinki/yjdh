import YouthApplication from 'kesaseteli/youth/types/youth-application';
import YouthFormData from 'kesaseteli/youth/types/youth-form-data';
import { convertFormDataToApplication } from 'kesaseteli/youth/utils/youth-form-data.utils';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useGetLanguage from 'shared/hooks/useGetLanguage';

const useCreateYouthApplicationQuery = (): UseMutationResult<
  YouthApplication,
  unknown,
  YouthFormData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const getLanguage = useGetLanguage();
  return useMutation('createApplication', (formData) =>
    handleResponse<YouthApplication>(
      axios.post(BackendEndpoint.YOUTH_APPLICATIONS, {
        ...convertFormDataToApplication(formData),
        language: getLanguage(),
      })
    )
  );
};

export default useCreateYouthApplicationQuery;
