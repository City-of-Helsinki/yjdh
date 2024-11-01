import { AxiosError } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { INSTALMENT_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  id: string;
  status: INSTALMENT_STATUSES;
};

const useInstalmentStatusTransition = (): UseMutationResult<
  null,
  Error,
  Payload
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<null, Error, Payload>(
    'instalments',
    ({ id, status }: Payload) =>
      handleResponse(
        axios.patch(
          `${HandlerEndpoint.HANDLER_INSTALMENT_STATUS_TRANSITION(id)}`,
          { status }
        )
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('applicationsList');
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

export default useInstalmentStatusTransition;
