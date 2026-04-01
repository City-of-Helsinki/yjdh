import { AxiosError } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  id: string;
  employerAssurance: boolean;
};

const useChangeEmployerAssurance = (): UseMutationResult<
  null,
  Error,
  Payload
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<null, Error, Payload>(
    'employer-assurance',
    ({ id, employerAssurance }: Payload) =>
      handleResponse(
        axios.patch(
          `${HandlerEndpoint.HANDLER_CHANGE_EMPLOYER_ASSURANCE(id)}`,
          { employerAssurance }
        )
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('applicationsList');
        void queryClient.invalidateQueries('application');
        void queryClient.invalidateQueries('applications');
      },
      onError: (error: AxiosError<Error, Record<string, string[]>>) => {
        showErrorToast(
          t('common:error.generic.label'),
          t('common:error.generic.text')
        );
        // eslint-disable-next-line no-console
        console.log(error);
      },
    }
  );
};

export default useChangeEmployerAssurance;
