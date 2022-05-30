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
      console.log('go to apllicaion page', locale, application.id);
      void router.push(`${locale}/application?id=${application.id}`);
    },
    [router, language]
  );

  React.useEffect(() => {
    console.log('use effect');
    if (draftApplicationQuery.isSuccess) {
      console.log('draftApplicationQuery.isSuccess');
      const draftApplication = draftApplicationQuery.data;
      if (draftApplication) {
        console.log('draftApplication');
        goToApplicationPage(draftApplication);
      } else if (createApplicationQuery.isSuccess) {
        console.log('createApplicationQuery.isSuccess', createApplicationQuery);
        const newApplication = createApplicationQuery.data;
        if (newApplication) {
          console.log('newApplication');
          goToApplicationPage(newApplication);
        }
      } else if (createApplicationQuery.isIdle) {
        console.log('createApplicationQuery.isIdle');
        createApplicationQuery.mutate(undefined, { onError });
      }
    }
  }, [
    draftApplicationQuery,
    createApplicationQuery,
    goToApplicationPage,
    onError,
  ]);
};

export default useLoadDraftOrCreateNewApplicationEffect;
