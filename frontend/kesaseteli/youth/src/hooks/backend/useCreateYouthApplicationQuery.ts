import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import YouthApplication from 'kesaseteli-shared/types/youth-application';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import { convertFormDataToApplication } from 'kesaseteli-shared/utils/youth-form-data.utils';
import { useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useGetLanguage from 'shared/hooks/useGetLanguage';

type Options = {
  request_additional_information?: YouthApplication['request_additional_information'];
};

const useCreateYouthApplicationQuery = (
  options: Options = {}
): UseMutationResult<CreatedYouthApplication, unknown, YouthFormData> => {
  const { axios, handleResponse } = useBackendAPI();
  const getLanguage = useGetLanguage();
  return useMutation(BackendEndpoint.YOUTH_APPLICATIONS, (formData) =>
    handleResponse<CreatedYouthApplication>(
      axios.post(BackendEndpoint.YOUTH_APPLICATIONS, {
        ...convertFormDataToApplication(formData),
        language: getLanguage(),
        ...options,
      })
    )
  );
};

export default useCreateYouthApplicationQuery;
