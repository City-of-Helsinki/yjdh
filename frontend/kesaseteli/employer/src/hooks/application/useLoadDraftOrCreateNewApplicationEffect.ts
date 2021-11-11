import { useRouter } from 'next/router';
import React from 'react';
import { UseMutationResult, UseQueryResult } from 'react-query';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';

const useLoadDraftOrCreateNewApplicationEffect = (
  draftApplicationQuery: UseQueryResult<Application | undefined, Error>,
  createApplicationQuery: UseMutationResult<Application, Error, void>
): void => {
  const router = useRouter();
  const language = useLocale();

  const goToApplicationPage = React.useCallback(
    (application: Application) => {
      const locale = application.language ?? language;
      void router.push(`${locale}/application?id=${application.id}`);
    },
    [router, language]
  );

  React.useEffect(() => {
    if (draftApplicationQuery.isSuccess) {
      const draftApplication = draftApplicationQuery.data;
      if (draftApplication) {
        goToApplicationPage(draftApplication);
      } else if (createApplicationQuery.isSuccess) {
        const newApplication = createApplicationQuery.data;
        if (newApplication) {
          goToApplicationPage(newApplication);
        }
      } else if (createApplicationQuery.isIdle) {
        createApplicationQuery.mutate();
      }
    }
  }, [draftApplicationQuery, createApplicationQuery, goToApplicationPage]);
};

export default useLoadDraftOrCreateNewApplicationEffect;
