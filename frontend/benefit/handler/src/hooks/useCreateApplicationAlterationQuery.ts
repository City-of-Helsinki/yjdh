import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import { MutationFunction, useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

type Props = {
  onSuccess: MutationFunction<void, ApplicationAlterationData>;
};

const useCreateApplicationQuery = ({
  onSuccess,
}: Props): UseMutationResult<
  ApplicationAlterationData,
  AxiosError<unknown>,
  ApplicationAlterationData
> => {
  const { axios, handleResponse } = useBackendAPI();

  return useMutation<
    ApplicationAlterationData,
    AxiosError<ErrorData>,
    ApplicationAlterationData
  >(
    'createApplicationAlteration',
    (alteration: ApplicationAlterationData) =>
      handleResponse<ApplicationAlterationData>(
        axios.post(BackendEndpoint.HANDLER_APPLICATION_ALTERATION, alteration)
      ),
    {
      onSuccess,
    }
  );
};

export default useCreateApplicationQuery;
