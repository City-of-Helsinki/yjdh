import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  id: string;
  status: BATCH_STATUSES;
};

const useBatchStatus = (): UseMutationResult<null, Error, Payload> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<null, Error, Payload>(
    'changeBatchStatus',
    ({ id, status }: Payload) =>
      handleResponse<null>(
        axios.patch<null>(HandlerEndpoint.BATCH_STATUS_CHANGE(id), {
          status,
        })
      ),
    {
      onSuccess: ({
        status: backendStatus,
        decision,
      }: {
        status: BATCH_STATUSES;
        decision: PROPOSALS_FOR_DECISION;
      }) => {
        if (backendStatus === BATCH_STATUSES.SENT_TO_TALPA) {
          showSuccessToast(
            t(
              `common:batches.notifications.registerToAhjo.${backendStatus}.${decision}`
            ),
            ''
          );
        } else {
          showSuccessToast(
            t(`common:batches.notifications.registerToAhjo.${backendStatus}`),
            ''
          );
        }

        if (
          backendStatus === BATCH_STATUSES.SENT_TO_TALPA ||
          backendStatus === BATCH_STATUSES.DRAFT
        ) {
          void queryClient.invalidateQueries('applicationsList');
        }
      },
      onError: () => handleError(),
    }
  );
};

export default useBatchStatus;
