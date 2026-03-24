import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  id: string;
  dueDate: string; // expected format: YYYY-MM-DD
};

const useInstalmentDateChange = (): UseMutationResult<null, Error, Payload> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<null, Error, Payload>(
    'instalments',
    ({ id, dueDate }: Payload) =>
      handleResponse(
        axios.patch(`${HandlerEndpoint.HANDLER_INSTALMENT_CHANGE_DATE(id)}`, {
          due_date: dueDate,
        })
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('applicationsList');
        void queryClient.invalidateQueries('application');
        void queryClient.invalidateQueries('applications');
      },
      onError: (error: Error) => {
        showErrorToast(
          t('common:error.newDate.label'),
          t('common:error.newDate.text')
        );
        // eslint-disable-next-line no-console
        console.log(error);
      },
    }
  );
};

export default useInstalmentDateChange;
