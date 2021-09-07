import useApplicationIdQueryParam from 'kesaseteli/employer/hooks/application/useApplicationIdQueryParam';
import useApplicationQuery from 'kesaseteli/employer/hooks/backend/useApplicationQuery';
import useUpdateApplicationQuery from 'kesaseteli/employer/hooks/backend/useUpdateApplicationQuery';
import {UseMutationResult, UseQueryResult} from 'react-query';
import DraftApplication from 'shared/types/draft-application';
import Application from 'shared/types/employer-application';
import { isEmpty } from 'shared/utils/array.utils';

export type ApplicationQueryResult =  UseQueryResult<Application, Error>;
export type ApplicationMutationResult = UseMutationResult<Application, Error, DraftApplication>;

export type ApplicationApi = {
  applicationId?: string,
  application: ApplicationQueryResult['data'];
  updateApplication: (
    application: DraftApplication
  ) => void;
  sendApplication: (
    application: Application
  ) => void;
  addEmployment: (
    application: DraftApplication
  ) => void;
  removeEmployment: (
    application: DraftApplication,
    index: number
  ) => void;
  isLoading: ApplicationQueryResult['isLoading'];
  isUpdating: ApplicationQueryResult['isLoading'];
  loadingError: ApplicationQueryResult['error'];
  updatingError: ApplicationMutationResult['error'];
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

  const addEmployment: ApplicationApi['addEmployment']  = (draftApplication: DraftApplication) => {
    const summer_vouchers = [
      ...draftApplication.summer_vouchers ?? [],
      {unnumbered_summer_voucher_reason: 'lorem ipsum'} // todo later empty when backend bug addressed
    ];
    return mutate({ ...draftApplication, status: 'draft', summer_vouchers })
  };

  const removeEmployment: ApplicationApi['removeEmployment']  = (draftApplication: DraftApplication, index:number) => {
    const summer_vouchers =
      (draftApplication.summer_vouchers ?? []).filter((elem, i) => i !== index);
    return mutate({ ...draftApplication, status: 'draft', summer_vouchers })
  };

  const updateApplication : ApplicationApi['updateApplication'] = (draftApplication: DraftApplication) => {
    if (isEmpty(draftApplication.summer_vouchers)) {
      return addEmployment(draftApplication);
    };
    return mutate({ ...draftApplication, status: 'draft' });
  }
  const sendApplication: ApplicationApi['sendApplication'] = (completeApplication: Application) => mutate({ ...completeApplication, status: 'submitted' })


  return {
    applicationId,
    application,
    updateApplication,
    sendApplication,
    addEmployment,
    removeEmployment,
    isLoading,
    isUpdating,
    loadingError,
    updatingError,
    isError: Boolean(loadingError || updatingError),
  };
};

export default useApplicationApi;
