import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Payload = {
  id: string;
  employerAssurance: boolean;
};

type MutationContext = {
  previousApplication: unknown;
  previousApplications: unknown;
};

const useChangeEmployerAssurance = (): UseMutationResult<
  null,
  Error,
  Payload,
  MutationContext
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<null, Error, Payload, MutationContext>(
    'employer-assurance',
    ({ id, employerAssurance }: Payload) =>
      handleResponse(
        axios.patch(
          `${HandlerEndpoint.HANDLER_CHANGE_EMPLOYER_ASSURANCE(id)}`,
          { employerAssurance }
        )
      ),
    {
      onMutate: async ({ id, employerAssurance }) => {
        await queryClient.cancelQueries('application');
        await queryClient.cancelQueries('applications');

        const previousApplication = queryClient.getQueryData([
          'application',
          id,
        ]);
        const previousApplications = queryClient.getQueryData('applications');

        queryClient.setQueryData(['application', id], (current: unknown) =>
          current && typeof current === 'object' ? { ...current, employerAssurance } : current
        );

        queryClient.setQueryData('applications', (current: unknown) => {
          if (!Array.isArray(current)) {
            return current;
          }

          return current.map((application) =>
            application?.id === id
              ? { ...application, employerAssurance }
              : application
          );
        });

        return { previousApplication, previousApplications };
      },
      onSuccess: (_, { id }) =>
        Promise.all([
          queryClient.invalidateQueries('applications'),
          queryClient.invalidateQueries(['application', id]),
        ]),
      onError: (error: unknown, { id }, context) => {
        if (context?.previousApplication !== undefined) {
          queryClient.setQueryData(
            ['application', id],
            context.previousApplication
          );
        }

        if (context?.previousApplications !== undefined) {
          queryClient.setQueryData(
            'applications',
            context.previousApplications
          );
        }

        showErrorToast(
          t('common:error.employerAssurance.label'),
          t('common:error.employerAssurance.text')
        );
        // eslint-disable-next-line no-console
        console.log(error);
      },
    }
  );
};

export default useChangeEmployerAssurance;
