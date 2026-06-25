import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useChangeHandlerMutation = (): UseMutationResult<
  null,
  AxiosError<Error, Record<string, string[]>>,
  string
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<null, AxiosError<Error, Record<string, string[]>>, string>(
    {
      mutationKey: ['changeHandler'],
      mutationFn: (id) =>
        handleResponse(
          axios.patch(
            `${BackendEndpoint.HANDLER_APPLICATIONS}${id}/change-handler/`
          )
        ),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['applications'] });
        void queryClient.invalidateQueries({ queryKey: ['application'] });
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

export default useChangeHandlerMutation;
