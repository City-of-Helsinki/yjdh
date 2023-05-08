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
import format from 'date-fns/format';
import parse from 'date-fns/parse';

type TalpaForm = {
  decision_maker_name: string;
  decision_maker_title: string;
  section_of_the_law: string;
  decision_date: string;
  expert_inspector_name: string;
  expert_inspector_title: string;
};

type Payload = {
  id: string;
  status: BATCH_STATUSES;
  form?: TalpaForm;
};

type Response = {
  status: BATCH_STATUSES;
  decision: PROPOSALS_FOR_DECISION;
};

const useBatchComplete = (): UseMutationResult<Response, Error, Payload> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<Response, Error, Payload>(
    'changeBatchStatus',
    ({ id, status, form }: Payload) => {
      const parsed = parse(form.decision_date, 'd.M.yyyy', new Date());
      const parsedAsDatenew = format(parsed, 'yyyy-MM-dd');
      const formattedForm: TalpaForm = {
        ...form,
        ...{ decision_date: parsedAsDatenew },
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
      onSuccess: ({ status: backendStatus }: Response) => {
        showSuccessToast(
          t(`common:batches.notifications.registerToAhjo.${backendStatus}`),
          ''
        );
        void queryClient.invalidateQueries('applicationsList');
      },
      onError: () => handleError(),
    }
  );
};

export default useBatchComplete;
