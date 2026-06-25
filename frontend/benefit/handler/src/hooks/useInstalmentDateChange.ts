import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
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

  return useMutation<null, Error, Payload>({
    mutationKey: ['instalment'],
    mutationFn: ({ id, dueDate }: Payload) =>
      handleResponse(
        axios.patch(`${HandlerEndpoint.HANDLER_INSTALMENT_CHANGE_DATE(id)}`, {
          due_date: dueDate,
        })
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      void queryClient.invalidateQueries({ queryKey: ['application'] });
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: Error) => {
      showErrorToast(
        t('common:error.newDate.label'),
        t('common:error.newDate.text')
      );
      // eslint-disable-next-line no-console
      console.log(error);
    },
  });
};

export default useInstalmentDateChange;
