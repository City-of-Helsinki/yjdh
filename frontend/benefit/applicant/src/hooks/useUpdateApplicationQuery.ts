import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useUpdateApplicationQuery = (
  setIsSubmittedApplication?: React.Dispatch<React.SetStateAction<boolean>>
): UseMutationResult<
  ApplicationData,
  AxiosError<ErrorData>,
  ApplicationData
> => {
  const { t } = useTranslation();

  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<ApplicationData, AxiosError<ErrorData>, ApplicationData>(
    'updateApplication',
    (application: ApplicationData) =>
      handleResponse<ApplicationData>(
        axios.put(
          `${BackendEndpoint.APPLICATIONS}${application?.id ?? ''}/`,
          application
        )
      ),
    {
      onSuccess: (updatedApplication: ApplicationData) => {
        if (
          setIsSubmittedApplication &&
          [
            APPLICATION_STATUSES.HANDLING,
            APPLICATION_STATUSES.RECEIVED,
          ].includes(updatedApplication.status)
        ) {
          setIsSubmittedApplication(true);
        }
        void queryClient.invalidateQueries('applications');
        void queryClient.invalidateQueries('application');
      },
      onError: () => {
        showErrorToast(
          t('common:error.generic.label'),
          t('common:error.generic.text')
        );
      },
    }
  );
};

export default useUpdateApplicationQuery;
