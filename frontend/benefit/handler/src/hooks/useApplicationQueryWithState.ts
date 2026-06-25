import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Application } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import React, { useEffect } from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { getApplication } from '../components/applicationForm/utils/applicationForm';

const useApplicationQueryWithState = (
  id: string,
  setApplication: React.Dispatch<React.SetStateAction<Application>>
): UseQueryResult<ApplicationData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  const query = useQuery<ApplicationData, Error>({
    queryKey: ['applications', id],
    queryFn: () =>
      id
        ? handleResponse<ApplicationData>(
            axios.get(`${BackendEndpoint.HANDLER_APPLICATIONS}${id}/`)
          )
        : Promise.reject(new Error('Missing application id')),
    enabled: Boolean(id),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data) {
      setApplication(getApplication(query.data));
    }
  }, [query.data, setApplication]);

  return query;
};

export default useApplicationQueryWithState;
