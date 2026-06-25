import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

type Props = {
  onSuccess: (data: ApplicationAlterationData) => void | Promise<void>;
};

const useCreateApplicationQuery = ({
  onSuccess,
}: Props): UseMutationResult<
  ApplicationAlterationData,
  AxiosError<ErrorData>,
  ApplicationAlterationData
> => {
  const { axios, handleResponse } = useBackendAPI();

  return useMutation<
    ApplicationAlterationData,
    AxiosError<ErrorData>,
    ApplicationAlterationData
  >({
    mutationKey: ['createApplicationAlteration'],
    mutationFn: (alteration: ApplicationAlterationData) =>
      handleResponse<ApplicationAlterationData>(
        axios.post(BackendEndpoint.APPLICATION_ALTERATION, alteration)
      ),
    onSuccess,
  });
};

export default useCreateApplicationQuery;
