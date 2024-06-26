import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationData } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useUpdateApplicationQuery = (): UseMutationResult<
  ApplicationData,
  AxiosError<ErrorData>,
  ApplicationData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<ApplicationData, AxiosError<ErrorData>, ApplicationData>(
    'updateApplication',
    (application: ApplicationData) =>
      handleResponse<ApplicationData>(
        axios.put(
          `${BackendEndpoint.HANDLER_APPLICATIONS}${application?.id ?? ''}/`,
          { ...application }
        )
      ),
    {
      onSuccess: (response: ApplicationData) => {
        void queryClient.invalidateQueries('applications');
        void queryClient.invalidateQueries('application');
        if (
          [
            APPLICATION_STATUSES.ACCEPTED,
            APPLICATION_STATUSES.REJECTED,
          ].includes(response.status)
        ) {
          void router.push(`/application?id=${response.id}&action=submit`);
        }
      },
      onError: (error: AxiosError) => {
        const errorStatus = error.code;
        if (error.response)
          // eslint-disable-next-line no-console
          console.warn('Error response:', error.response?.data ?? '');
        showErrorToast(
          t('common:applications.list.errors.fetch.label'),
          t('common:applications.list.errors.fetch.text', {
            status: errorStatus,
          })
        );
      },
    }
  );
};

export default useUpdateApplicationQuery;
