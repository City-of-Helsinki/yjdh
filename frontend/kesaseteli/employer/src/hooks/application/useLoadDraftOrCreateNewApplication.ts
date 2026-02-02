import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import { useRouter } from 'next/router';
import React from 'react';
import { UseMutationResult,useQueryClient } from 'react-query';
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
  const onError = useErrorHandler();

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
        onError,
        onSuccess: goToApplicationPage,
      }),
    [createApplicationQuery, onError, goToApplicationPage]
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
