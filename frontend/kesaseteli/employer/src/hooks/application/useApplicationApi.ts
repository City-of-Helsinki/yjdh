import useApplicationIdQueryParam from 'kesaseteli/employer/hooks/application/useApplicationIdQueryParam';
import useApplicationQuery from 'kesaseteli/employer/hooks/backend/useApplicationQuery';
import useUpdateApplicationQuery from 'kesaseteli/employer/hooks/backend/useUpdateApplicationQuery';
import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';
import React from 'react';
import { UseMutationResult, UseQueryResult } from 'react-query';
import Application from 'shared/types/application';
import DraftApplication from 'shared/types/draft-application';
import { getFormApplication } from 'shared/utils/application.utils';

export type ApplicationQueryResult = UseQueryResult<Application, Error>;
export type ApplicationMutationResult = UseMutationResult<
  Application,
  Error,
  DraftApplication
>;

export type ApplicationApi = {
  applicationId?: string;
  application: ApplicationQueryResult['data'];
  updateApplication: (
    application: DraftApplication,
    onSuccess?: () => void
  ) => void;
  sendApplication: (application: Application, onSuccess?: () => void) => void;
  addEmployment: (
    application: DraftApplication,
    onSuccess?: () => void
  ) => void;
  removeEmployment: (
    application: DraftApplication,
    index: number,
    onSuccess?: () => void
  ) => void;
  isLoading: ApplicationQueryResult['isLoading'];
  isUpdating: ApplicationQueryResult['isLoading'];
  loadingError: ApplicationQueryResult['error'];
  updatingError: ApplicationMutationResult['error'];
  isError: boolean;
};

export type Params = {
  onUpdateSuccess: (application: DraftApplication) => void;
  onSendSuccess: (application: Application) => void;
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

  const addEmployment: ApplicationApi['addEmployment'] = (
    draftApplication: DraftApplication,
    onSuccess: (application: DraftApplication) => void = noop
  ) => {
    const summer_vouchers = [...(draftApplication.summer_vouchers ?? []), {}];
    return mutate(
      { ...draftApplication, status: 'draft', summer_vouchers },
      {
        onSuccess: () => onSuccess(draftApplication),
      }
    );
  };

  const removeEmployment: ApplicationApi['removeEmployment'] = (
    draftApplication: DraftApplication,
    index: number,
    onSuccess: (application: DraftApplication) => void = noop
  ) => {
    const summer_vouchers = (draftApplication.summer_vouchers ?? []).filter(
      (elem, i) => i !== index
    );
    return mutate(
      { ...draftApplication, status: 'draft', summer_vouchers },
      {
        onSuccess: () => onSuccess(draftApplication),
      }
    );
  };

  const updateApplication: ApplicationApi['updateApplication'] = (
    draftApplication: DraftApplication,
    onSuccess = noop
  ) => {
    if (isEmpty(draftApplication.summer_vouchers)) {
      return addEmployment(draftApplication, onSuccess);
    }
    return mutate(
      { ...draftApplication, status: 'draft' },
      {
        onSuccess,
      }
    );
  };
  const sendApplication: ApplicationApi['sendApplication'] = (
    completeApplication: Application,
    onSuccess = noop
  ) =>
    mutate(
      { ...completeApplication, status: 'submitted' },
      {
        onSuccess: () => {
          clearLocalStorage(`application-${completeApplication.id}`);
          onSuccess();
        },
      }
    );

  const formApplication = React.useMemo(
    () => application && getFormApplication(application),
    [application]
  );

  return {
    applicationId,
    application: formApplication,
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
