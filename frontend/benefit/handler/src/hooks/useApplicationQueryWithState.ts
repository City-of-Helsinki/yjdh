import { Application } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import React from 'react';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { getApplication } from '../components/newApplication/utils/applicationForm';

const useApplicationQueryWithState = (
  id: string,
  setApplication: React.Dispatch<React.SetStateAction<Application>>
): UseQueryResult<ApplicationData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData, Error>(
    ['applications', id],
    () =>
      !id
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<ApplicationData>(
            axios.get(`${BackendEndpoint.HANDLER_APPLICATIONS}${id}/`)
          ),
    {
      onSuccess: (data) => {
        setApplication(getApplication(data));
      },
      enabled: Boolean(id),
      staleTime: Infinity,
    }
  );
};

export default useApplicationQueryWithState;
