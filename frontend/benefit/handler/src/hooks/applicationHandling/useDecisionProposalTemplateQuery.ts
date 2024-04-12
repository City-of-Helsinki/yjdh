import { DecisionProposalTemplateData } from 'benefit/handler/types/common';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useDecisionProposalTemplateQuery = (
  id: string,
  decisionType: string
): UseQueryResult<DecisionProposalTemplateData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  return useQuery<DecisionProposalTemplateData[], Error>(
    ['decisionProposalTemplates'],
    () =>
      !id
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<DecisionProposalTemplateData[]>(
            axios.get(`${String(BackendEndpoint.DECISION_PROPOSAL_TEMPLATE)}`, {
              params: {
                decision_type: decisionType,
                application_id: id,
              },
            })
          )
  );
};

export default useDecisionProposalTemplateQuery;
