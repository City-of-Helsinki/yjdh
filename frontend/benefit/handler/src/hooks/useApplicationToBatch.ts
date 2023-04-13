import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

interface Payload {
  applicationIds?: string[];
  status?: APPLICATION_STATUSES;
}

const useAddToBatchQuery = (): UseMutationResult<Payload, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<Payload, Error, Payload>(
    'addApplicationToBatch',
    ({ applicationIds, status }: Payload) =>
      handleResponse<Payload>(
        axios.post<Payload>(
          `${BackendEndpoint.APPLICATION_BATCHES}create_batch/`,
          {
            application_ids: applicationIds,
            status,
          }
        )
      ),
    {
      onSuccess: (_, { applicationIds }) => {
        showSuccessToast(
          'Hakemuksia siirretty koontiin',
          `Olet siirtänyt ${applicationIds.length} hakemusta odottamaan Ahjoon vientiä.`
        );
        void queryClient.invalidateQueries('applicationsList');
      },
      onError: () => handleError(),
    }
  );
};

export default useAddToBatchQuery;
