import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import {
  AhjoSettingsResponse,
  AhjoSigner,
  AhjoSignerOptions,
  DecisionMaker,
  DecisionMakerOptions,
} from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type AhjoSettingsType = 'ahjo_decision_maker' | 'ahjo_signer';

const useAhjoSettingsQuery = (type: AhjoSettingsType): UseQueryResult<
  DecisionMakerOptions | AhjoSignerOptions,
  Error
> => {
  const { axios, handleResponse } = useBackendAPI();
  return useQuery<DecisionMakerOptions | AhjoSignerOptions, Error>(['ahjoSettings', type], () =>
    handleResponse<AhjoSettingsResponse>(
      axios.get(`${String(BackendEndpoint.AHJO_SETTINGS)}${type}`)
    ).then(
      (response) => {
        if (type === 'ahjo_decision_maker') {
          return (response?.data || []).map((item: DecisionMaker) =>
            camelcaseKeys(item, { deep: true })
          );
        } 
          return (response?.data || []).map((item: AhjoSigner) =>
            camelcaseKeys(item, { deep: true })
          );
        
      }
    )
  );
};

export default useAhjoSettingsQuery;
