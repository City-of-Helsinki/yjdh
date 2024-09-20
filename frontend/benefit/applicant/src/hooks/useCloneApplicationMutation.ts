import { AxiosError } from 'axios';
import {
  ApplicantEndpoint,
  BackendEndpoint,
} from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Response = {
  id?: string;
};

const useCloneApplicationMutation = (): UseMutationResult<
  Response,
  unknown,
  string | null
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  return useMutation(
    'clone_application',
    (id?: string) =>
      id
        ? handleResponse<Response>(
            axios.get(ApplicantEndpoint.APPLICATIONS_CLONE_AS_DRAFT(id))
          )
        : handleResponse<Response>(
            axios.get(BackendEndpoint.APPLICATIONS_CLONE_LATEST)
          ),
    {
      onError: (error: AxiosError) => {
        if (error?.response?.status === 404)
          showErrorToast(
            t('common:applications.errors.cloneError.title'),
            t('common:applications.errors.cloneError.message')
          );
        else {
          showErrorToast('Error cloning application', '');
        }
      },
    }
  );
};

export default useCloneApplicationMutation;
