import { BatchData } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { PROPOSALS_FOR_DESISION } from '../constants';

export const getReportsApplicationBatchesQueryKey = (
  proposalForDecision: PROPOSALS_FOR_DESISION
): string => `${BackendEndpoint.APPLICATION_BATCHES}${proposalForDecision}`;

const useReportsApplicationBatchesQuery = (
  proposalForDecision: PROPOSALS_FOR_DESISION
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
