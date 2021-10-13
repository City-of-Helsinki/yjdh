import { useRouter } from 'next/router';
import React from 'react';
import { UseMutateFunction } from 'react-query';
import useIsSyncingToBackend from 'shared/hooks/useIsSyncingToBackend';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';

const useLoadDraftOrCreateNewApplication = (
  isError: boolean,
  applications: Application[] | undefined,
  newApplication: Application | undefined,
  createApplication: UseMutateFunction<Application, Error, void, unknown>
): void => {
  const router = useRouter();
  const language = useLocale();
  const { isSyncing } = useIsSyncingToBackend();

  React.useEffect(() => {
    if (!isSyncing && !isError) {
      const previousApplication = applications?.find(
        (application) => application.status === 'draft'
      );
      const draftApplication = previousApplication ?? newApplication;
      if (draftApplication) {
        const locale = draftApplication.language ?? language;
        void router.push(`${locale}/application?id=${draftApplication.id}`);
      } else if (applications && !previousApplication) {
        createApplication();
      }
    }
  }, [
    isSyncing,
    applications,
    newApplication,
    createApplication,
    isError,
    language,
    router,
  ]);
};

export default useLoadDraftOrCreateNewApplication;
