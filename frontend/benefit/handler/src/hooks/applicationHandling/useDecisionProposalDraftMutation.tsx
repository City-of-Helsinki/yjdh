import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { Application } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import {
  DecisionProposalDraft,
  DecisionProposalDraftData,
} from 'benefit-shared/types/application';
import { prettyPrintObject } from 'benefit-shared/utils/errors';
import camelcaseKeys from 'camelcase-keys';
import { useTranslation } from 'next-i18next';
import React from 'react';
import hdsToast from 'shared/components/toast/Toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import snakecaseKeys from 'snakecase-keys';

const useDecisionProposalDraftMutation = (
  application: Application
): UseMutationResult<
  DecisionProposalDraftData,
  Error,
  DecisionProposalDraft
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<DecisionProposalDraftData, Error, DecisionProposalDraft>({
    mutationKey: ['changeDecisionProposal'],
    mutationFn: (decisionProposalPayload: DecisionProposalDraft) =>
      application.id
        ? handleResponse<DecisionProposalDraftData>(
            axios.patch(`${BackendEndpoint.DECISION_PROPOSAL_DRAFT}`, {
              ...snakecaseKeys(
                decisionProposalPayload as Record<string, unknown>
              ),
            })
          )
        : Promise.reject(new Error('Missing application id')),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['application'] });
    },
    onError: (error: Error & { response?: { data?: unknown } }) => {
      const errorData = camelcaseKeys(error.response?.data ?? {});
      const isContentTypeHTML = typeof errorData === 'string';
      hdsToast({
        autoDismissTime: 0,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: isContentTypeHTML
          ? t('common:error.generic.text')
          : Object.entries(errorData).map(([key, value]) =>
              typeof value === 'string' ? (
                <a key={key} href={`#${key}`}>
                  {value}
                </a>
              ) : (
                prettyPrintObject({ data: value as Record<string, string[]> })
              )
            ),
      });
    },
  });
};

export default useDecisionProposalDraftMutation;
