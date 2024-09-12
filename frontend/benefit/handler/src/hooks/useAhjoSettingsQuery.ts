import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import {
  AhjoSettingsResponse,
  DecisionMaker,
  DecisionMakerOptions,
} from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useAhjoSettingsQuery = (): UseQueryResult<
  DecisionMakerOptions,
  Error
> => {
  const { axios, handleResponse } = useBackendAPI();
  return useQuery<DecisionMakerOptions, Error>(['decisionMakerOptions'], () =>
    handleResponse<AhjoSettingsResponse>(
      axios.get(`${String(BackendEndpoint.AHJO_SETTINGS)}`)
    ).then(
      (response) =>
        response?.data?.map((item: DecisionMaker) =>
          camelcaseKeys(item, { deep: true })
        ) || []
    )
  );
};

export default useAhjoSettingsQuery;
