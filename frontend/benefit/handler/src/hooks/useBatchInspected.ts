import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type BatchCompletionDetails = {
  decision_maker_name: string;
  decision_maker_title: string;
  section_of_the_law: string;
  decision_date: string | Date;
  expert_inspector_name: string;
  expert_inspector_title: string;
  p2p_inspector_name: string;
  p2p_inspector_email: string;
  p2p_checker_name: string;
};

type Payload = {
  id: string;
  status: BATCH_STATUSES;
  form?: BatchCompletionDetails;
};

type Response = {
  status: BATCH_STATUSES;
  decision: PROPOSALS_FOR_DECISION;
};

const useBatchInspected = (
  setBatchCloseAnimation: React.Dispatch<React.SetStateAction<boolean>>
): UseMutationResult<Response, Error, Payload> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleError = (): void => {
    setBatchCloseAnimation(false);
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', {
        status: 'unknown error',
      })
    );
  };

  return useMutation<Response, Error, Payload>(
    'changeBatchStatus',
    ({ id, status, form }: Payload) => {
      const parsed = parse(String(form.decision_date), 'd.M.yyyy', new Date());
      const parsedAsDatenew = format(parsed, 'yyyy-MM-dd');
      const formattedForm: BatchCompletionDetails = {
        ...form,
        decision_date: parsedAsDatenew,
      };
      const request = axios.patch<Response>(
        HandlerEndpoint.BATCH_STATUS_CHANGE(id),
        {
          status,
          ...formattedForm,
        }
      );
      return handleResponse<Response>(request);
    },
    {
      onSuccess: ({ status: backendStatus, decision }: Response) => {
        showSuccessToast(
          t(`common:batches.notifications.registerToAhjo.${backendStatus}`),
          ''
        );
        if (decision === PROPOSALS_FOR_DECISION.REJECTED) {
          setBatchCloseAnimation(true);
        }
        setTimeout(() => {
          void queryClient.invalidateQueries('applicationsList');
        }, 700);
      },
      onError: () => handleError(),
    }
  );
};

export default useBatchInspected;
