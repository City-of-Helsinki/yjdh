import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import React from 'react';
import { UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';

export const useCreateApplication = (): {
  createApplication: () => void;
  goToApplicationPage: (application: Application) => void;
  createApplicationQuery: UseMutationResult<Application, unknown, void>;
} => {
  const router = useRouter();
  const language = useLocale();
  const queryClient = useQueryClient();
  const createApplicationQuery = useCreateApplicationQuery();
  const errorHandler = useErrorHandler();
  const { axios, handleResponse } = useBackendAPI();

  const goToApplicationPage = React.useCallback(
    (application: Application): void => {
      void queryClient.cancelQueries();
      const locale = application.language ?? language;
      void router.push(`${locale}/application?id=${application.id}`);
    },
    [queryClient, language, router]
  );

  const createApplication = React.useCallback(
    () =>
      createApplicationQuery.mutate(undefined, {
        onError: errorHandler,
        onSuccess: (newApplication) => {
          const prefilledData = ApplicationPersistenceService.getEmployerData();
          if (prefilledData && newApplication.id) {
            void handleResponse<Application>(
              axios.put(
                `${BackendEndpoint.EMPLOYER_APPLICATIONS}${newApplication.id}/`,
                { ...newApplication, ...prefilledData, status: 'draft' }
              )
            )
              .then((updatedApplication) => {
                ApplicationPersistenceService.clearAll();
                goToApplicationPage(updatedApplication);
                return null;
              })
              .catch(errorHandler);
          } else {
            goToApplicationPage(newApplication);
          }
        },
      }),
    [
      createApplicationQuery,
      errorHandler,
      goToApplicationPage,
      axios,
      handleResponse,
    ]
  );

  return {
    createApplication,
    goToApplicationPage,
    createApplicationQuery,
  };
};

const useLoadDraftOrCreateNewApplication = (): void => {
  const { createApplication, goToApplicationPage, createApplicationQuery } =
    useCreateApplication();

  const draftApplicationQuery = useApplicationsQuery<Application | undefined>(
    (applications) => applications.find((app) => app.status === 'draft')
  );

  React.useEffect(() => {
    if (draftApplicationQuery.isSuccess) {
      const application = draftApplicationQuery.data;
      if (application) {
        goToApplicationPage(application);
      } else if (createApplicationQuery.isIdle) {
        createApplication();
      }
    }
  }, [
    draftApplicationQuery.isSuccess,
    draftApplicationQuery.data,
    createApplicationQuery.isIdle,
    goToApplicationPage,
    createApplication,
  ]);
};
export default useLoadDraftOrCreateNewApplication;
