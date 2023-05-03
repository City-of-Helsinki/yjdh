import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { PROPOSALS_FOR_DECISION } from 'benefit-shared/constants';
import { BatchData } from 'benefit-shared/types/application';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

export const getReportsApplicationBatchesQueryKey = (
  proposalForDecision: PROPOSALS_FOR_DECISION
): string => `${BackendEndpoint.APPLICATION_BATCHES}${proposalForDecision}`;

const useReportsApplicationBatchesQuery = (
  proposalForDecision: PROPOSALS_FOR_DECISION
): UseQueryResult<BatchData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<BatchData[], Error>(
    [getReportsApplicationBatchesQueryKey(proposalForDecision)],
    () =>
      proposalForDecision
        ? handleResponse<BatchData[]>(
            axios.get(
              `${BackendEndpoint.APPLICATION_BATCHES}?proposal_for_decision=${proposalForDecision}`
            )
          )
        : Promise.reject(new Error('Missing proposalForDecision')),
    { staleTime: Infinity }
  );
};

export default useReportsApplicationBatchesQuery;
