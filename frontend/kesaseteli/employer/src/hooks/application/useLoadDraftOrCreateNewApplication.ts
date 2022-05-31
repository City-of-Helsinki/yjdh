import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';

const useLoadDraftOrCreateNewApplication = (): void => {
  const router = useRouter();
  const language = useLocale();
  const onError = useErrorHandler();
  const queryClient = useQueryClient();
  const createApplicationQuery = useCreateApplicationQuery();

  const draftApplicationQuery = useApplicationsQuery<Application | undefined>(
    (applications) => applications.find((app) => app.status === 'draft')
  );

  const goToApplicationPage = (application: Application): void => {
    void queryClient.cancelQueries();
    const locale = application.language ?? language;
    void router.push(`${locale}/application?id=${application.id}`);
  };

  if (draftApplicationQuery.isSuccess) {
    const application = draftApplicationQuery.data;
    if (application) {
      goToApplicationPage(application);
    } else if (createApplicationQuery.isIdle) {
      createApplicationQuery.mutate(undefined, {
        onError,
        onSuccess: goToApplicationPage,
      });
    }
  }
};

export default useLoadDraftOrCreateNewApplication;
