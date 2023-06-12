import { AxiosError, AxiosResponse } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  id: string;
  status: BATCH_STATUSES;
};

type Response = {
  status: BATCH_STATUSES;
  previousStatus: BATCH_STATUSES;
};

interface BatchErrorResponse extends AxiosResponse {
  status: 400;
  data: {
    errorKey: string;
  };
}

interface BatchError extends AxiosError {
  response: BatchErrorResponse;
}

type SetStateFn = React.Dispatch<React.SetStateAction<boolean>>;

const useBatchStatus = (
  setBatchCloseAnimation?: SetStateFn
): UseMutationResult<Response, BatchError, Payload> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleError = (
    errorResponse: BatchError,
    previousStatus: BATCH_STATUSES
  ): void => {
    setBatchCloseAnimation(false);
    if (errorResponse.response?.data?.errorKey) {
      const { errorKey } = errorResponse.response.data;
      showErrorToast(
        t(
          `common:batches.notifications.errors.${errorKey}.${previousStatus}.title`
        ),
        t(
          `common:batches.notifications.errors.${errorKey}.${previousStatus}.message`
        )
      );
      return;
    }

    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<Response, BatchError, Payload>(
    'changeBatchStatus',
    ({ id, status }: Payload) => {
      const request = axios.patch<Response>(
        HandlerEndpoint.BATCH_STATUS_CHANGE(id),
        {
          status,
        }
      );
      return handleResponse<Response>(request);
    },
    {
      onSuccess: ({ status: backendStatus, previousStatus }: Response) => {
        showSuccessToast(
          t(`common:batches.notifications.registerToAhjo.${backendStatus}`),
          ''
        );
        if (
          previousStatus === BATCH_STATUSES.AWAITING_FOR_DECISION ||
          (previousStatus === BATCH_STATUSES.AHJO_REPORT_CREATED &&
            backendStatus === BATCH_STATUSES.AWAITING_FOR_DECISION)
        ) {
          setBatchCloseAnimation(true);
          setTimeout(() => {
            void queryClient.invalidateQueries('applicationsList');
          }, 700);
        } else {
          void queryClient.invalidateQueries('applicationsList');
        }
      },
      onError: (e: BatchError, { status: previousStatus }) =>
        handleError(e, previousStatus),
    }
  );
};

export default useBatchStatus;
