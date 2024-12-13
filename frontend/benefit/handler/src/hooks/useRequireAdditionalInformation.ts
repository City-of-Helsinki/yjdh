import { AxiosError } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  id: string;
  status: APPLICATION_STATUSES.INFO_REQUIRED | APPLICATION_STATUSES.HANDLING;
};

const useRequireAdditionalInformation = (): UseMutationResult<
  null,
  Error,
  Payload
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<null, Error, Payload>(
    'require_additional_information',
    ({ id, status }: Payload) =>
      handleResponse(
        axios.patch(
          `${HandlerEndpoint.HANDLER_REQUIRE_ADDITIONAL_INFORMATION(id)}`,
          { status }
        )
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('application');
        void queryClient.invalidateQueries('messages');
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

export default useRequireAdditionalInformation;
