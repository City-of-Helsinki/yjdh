import useApplicationIdQueryParam from 'kesaseteli/employer/hooks/application/useApplicationIdQueryParam';
import useApplicationQuery from 'kesaseteli/employer/hooks/backend/useApplicationQuery';
import useUpdateApplicationQuery from 'kesaseteli/employer/hooks/backend/useUpdateApplicationQuery';
import Application from 'shared/types/employer-application';
import { isEmpty } from 'shared/utils/array.utils';
import DraftApplication from 'shared/types/draft-application';

type QueryResult = ReturnType<typeof useApplicationQuery>;
type mutateResult = ReturnType<typeof useUpdateApplicationQuery>;

export type ApplicationApi = {
  applicationId?: string,
  application: QueryResult['data'];
  updateApplication: (
    application: DraftApplication
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

  const updateApplication = (draftApplication: DraftApplication): void => {
    const summer_vouchers = isEmpty(draftApplication.summer_vouchers) ? [{}] : draftApplication.summer_vouchers;
    mutate({ ...draftApplication, status: 'draft', summer_vouchers });
  }
  const sendApplication = (completeApplication: Application): void => {
    mutate({ ...completeApplication, status: 'submitted' });
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
