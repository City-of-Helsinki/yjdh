import { useRouter } from 'next/router';
import React from 'react';
import { UseMutationResult, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';

const useLoadDraftOrCreateNewApplicationEffect = (
  draftApplicationQuery: UseQueryResult<Application | undefined>,
  createApplicationQuery: UseMutationResult<Application, unknown, void>
): void => {
  const router = useRouter();
  const language = useLocale();
  const onError = useErrorHandler();
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
        createApplicationQuery.mutate(undefined, { onError });
      }
    }
  }, [draftApplicationQuery, createApplicationQuery, goToApplicationPage]);
};

export default useLoadDraftOrCreateNewApplicationEffect;
