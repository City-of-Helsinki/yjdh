import useApplicationIdQueryParam from 'kesaseteli/employer/hooks/application/useApplicationIdQueryParam';
import useApplicationQuery from 'kesaseteli/employer/hooks/backend/useApplicationQuery';
import useUpdateApplicationQuery from 'kesaseteli/employer/hooks/backend/useUpdateApplicationQuery';
import Application from 'shared/types/employer-application';

type QueryResult = ReturnType<typeof useApplicationQuery>;
type mutateResult = ReturnType<typeof useUpdateApplicationQuery>;

export type ApplicationApi = {
  applicationId?: string,
  application: QueryResult['data'];
  updateApplication: (
    application: Application
  ) => ReturnType<mutateResult['mutate']>;
  sendApplication: (
    application: Application
  ) => ReturnType<mutateResult['mutate']>;
  isLoading: QueryResult['isLoading'];
  isUpdating: QueryResult['isLoading'];
  loadingError: QueryResult['error'];
  updatingError: mutateResult['error'];
  isError: boolean,
};

const useApplicationApi = (): ApplicationApi => {
  const applicationId = useApplicationIdQueryParam();
  const {
    data: application,
    isLoading,
    error: loadingError,
  } = useApplicationQuery(applicationId);
  const {
    mutate,
    isLoading: isUpdating,
    error: updatingError,
  } = useUpdateApplicationQuery(application);

  const updateApplication = (draftApplication: Application): void => {
    mutate({ ...draftApplication, status: 'draft' });
  }
  const sendApplication = (draftApplication: Application): void => {
    mutate({ ...draftApplication, status: 'submitted' });
  }


  return {
    applicationId,
    application,
    updateApplication,
    sendApplication,
    isLoading,
    isUpdating,
    loadingError,
    updatingError,
    isError: Boolean(loadingError || updatingError),
  };
};

export default useApplicationApi;
