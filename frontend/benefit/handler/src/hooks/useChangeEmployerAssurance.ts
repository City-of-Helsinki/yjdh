import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useChangeEmployerAssurance = (): UseMutationResult<
  ApplicationData,
  AxiosError<ErrorData>,
  ApplicationData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<ApplicationData, AxiosError<ErrorData>, ApplicationData>(
    'changeEmployerAssurance',
    (application: ApplicationData) =>
      handleResponse<ApplicationData>(
        axios.patch(
          `${BackendEndpoint.HANDLER_APPLICATIONS}${application?.id ?? ''}/change-employer-assurance/`,
          { ...application }
        )
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('applicationsList');
        void queryClient.invalidateQueries('application');
        void queryClient.invalidateQueries('applications');
      },
      onError: (error: AxiosError<Error, Record<string, string[]>>) => {
        showErrorToast(
          t('common:applications.paidSalaries.error.heading'),
          t('common:applications.paidSalaries.error.text')
        );
        // eslint-disable-next-line no-console
        console.log(error);
      },
    }
  )
};

export default useChangeEmployerAssurance;
