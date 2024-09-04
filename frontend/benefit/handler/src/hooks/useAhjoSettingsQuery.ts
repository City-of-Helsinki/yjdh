import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { AhjoSettingsResponse, DecisionMakerOptions } from 'benefit-shared/types/application';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useAhjoSettingsQuery = (
): UseQueryResult<DecisionMakerOptions, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  return useQuery<DecisionMakerOptions, Error>(
    ['decisionMakerOptions'],
    () =>
       handleResponse<AhjoSettingsResponse>(
            axios.get(`${String(BackendEndpoint.AHJO_SETTINGS)}`)
          ).then((response) => response.data)
  );
};

export default useAhjoSettingsQuery;
