import { useRouter } from 'next/router';
import React from 'react';
import { UseMutateFunction } from 'react-query';
import useIsSyncingToBackend from 'shared/hooks/useIsSyncingToBackend';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import Application from 'shared/types/application';

const useLoadDraftOrCreateNewApplication = (
  isError: boolean,
  applications: Application[] | undefined,
  newApplication: Application | undefined,
  createApplication: UseMutateFunction<Application, Error, void, unknown>
): void => {
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LANGUAGE;
  const { isSyncing } = useIsSyncingToBackend();

  React.useEffect(() => {
    if (!isSyncing && !isError) {
      const draftApplication =
        applications && applications?.length > 0
          ? applications[0]
          : newApplication;
      if (draftApplication) {
        void router.push(`${locale}/application?id=${draftApplication.id}`);
      } else if (applications?.length === 0) {
        createApplication();
      }
    }
  }, [
    isSyncing,
    applications,
    newApplication,
    createApplication,
    isError,
    locale,
    router,
  ]);
};

export default useLoadDraftOrCreateNewApplication;
