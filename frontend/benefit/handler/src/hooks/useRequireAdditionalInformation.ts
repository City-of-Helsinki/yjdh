import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  id: string;
  status: APPLICATION_STATUSES.INFO_REQUIRED | APPLICATION_STATUSES.HANDLING;
};

const useRequireAdditionalInformation = (): UseMutationResult<
  null,
  AxiosError<Error, Record<string, string[]>>,
  Payload
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<
    null,
    AxiosError<Error, Record<string, string[]>>,
    Payload
  >({
    mutationKey: ['require_additional_information'],
    mutationFn: ({ id, status }: Payload) =>
      handleResponse(
        axios.patch(
          `${HandlerEndpoint.HANDLER_REQUIRE_ADDITIONAL_INFORMATION(id)}`,
          { status }
        )
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['application'] });
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: AxiosError<Error, Record<string, string[]>>) => {
      showErrorToast(
        t('common:error.generic.label'),
        t('common:error.generic.text')
      );
      // eslint-disable-next-line no-console
      console.log(error);
    },
  });
};

export default useRequireAdditionalInformation;
