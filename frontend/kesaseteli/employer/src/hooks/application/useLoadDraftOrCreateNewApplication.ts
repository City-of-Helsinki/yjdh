import { useRouter } from 'next/router';
import React from 'react';
import { UseMutateFunction } from 'react-query';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import EmployerApplication from 'shared/types/employer-application';

const useLoadDraftOrCreateNewApplication = (
  isLoading: boolean,
  isError: boolean,
  applications: EmployerApplication[] | undefined,
  newApplication: EmployerApplication | undefined,
  createApplication: UseMutateFunction<
    EmployerApplication,
    Error,
    void,
    unknown
  >
): void => {
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LANGUAGE;

  React.useEffect(() => {
    if (!isLoading && !isError) {
      const draftApplication =
        applications && applications?.length > 0
          ? applications[0]
          : newApplication;
      if (draftApplication) {
        void router.push(`${locale}/application?id=${draftApplication.id}`);
      } else {
        createApplication();
      }
    }
  }, [
    isLoading,
    applications,
    newApplication,
    createApplication,
    isError,
    locale,
    router,
  ]);
};

export default useLoadDraftOrCreateNewApplication;
