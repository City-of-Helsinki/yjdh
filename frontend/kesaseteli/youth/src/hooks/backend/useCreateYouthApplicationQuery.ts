import YouthApplication from 'kesaseteli/youth/types/youth-application';
import YouthFormData from 'kesaseteli/youth/types/youth-form-data';
import { convertFormDataToApplication } from 'kesaseteli/youth/utils/youth-form-data.utils';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useGetLanguage from 'shared/hooks/useGetLanguage';

const useCreateYouthApplicationQuery = (): UseMutationResult<
  YouthApplication,
  Error,
  YouthFormData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const router = useRouter();
  const getLanguage = useGetLanguage();
  return useMutation(
    'createApplication',
    (formData) =>
      handleResponse<YouthApplication>(
        axios.post(BackendEndpoint.YOUTH_APPLICATIONS, {
          ...convertFormDataToApplication(formData),
          language: getLanguage(),
        })
      ),
    {
      onError: (error) => handleError(error, t, router, getLanguage()),
    }
  );
};

export default useCreateYouthApplicationQuery;
