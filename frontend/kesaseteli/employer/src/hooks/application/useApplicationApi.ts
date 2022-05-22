import Axios from 'axios';
import useApplicationQuery from 'kesaseteli/employer/hooks/backend/useApplicationQuery';
import useUpdateApplicationQuery from 'kesaseteli/employer/hooks/backend/useUpdateApplicationQuery';
import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import noop from 'lodash/noop';
import { ErrorOption } from 'react-hook-form';
import { UseMutationResult, useQueryClient, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useRouterQueryParam from 'shared/hooks/useRouterQueryParam';
import Application from 'shared/types/application';
import DraftApplication from 'shared/types/draft-application';

export type ApplicationApi<T> = {
  applicationId?: string;
  isRouterLoading: boolean;
  applicationQuery: UseQueryResult<T>;
  updateApplicationQuery: UseMutationResult<
    Application,
    unknown,
    DraftApplication
  >;
  updateApplication: (
    application: DraftApplication,
    onSuccess?: () => void | Promise<void>
  ) => void;
  sendApplication: (
    application: Application,
    onSuccess?: () => void | Promise<void>
  ) => void;
  addEmployment: (
    application: DraftApplication,
    onSuccess?: () => void | Promise<void>
  ) => void;
  removeEmployment: (
    application: DraftApplication,
    index: number,
    onSuccess?: () => void | Promise<void>
  ) => void;
};

export type Params = {
  onUpdateSuccess: (application: DraftApplication) => void;
  onSendSuccess: (application: Application) => void;
};

type Options<T> = {
  setBackendValidationError?: (field: keyof T, error: ErrorOption) => void;
  select?: (application: Application) => T;
};

const useApplicationApi = <T = Application>(
  options?: Options<T>
): ApplicationApi<T> => {
  const { select, setBackendValidationError } = { ...options };
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');
  const queryClient = useQueryClient();
  const onError = useErrorHandler();

  const applicationQuery = useApplicationQuery<T>(applicationId, select);
  const updateApplicationQuery = useUpdateApplicationQuery(applicationId);

  const handleUpdateError = (error: unknown): void => {
    if (
      setBackendValidationError &&
      Axios.isAxiosError(error) &&
      error.response.status === 400
    ) {
      Object.keys(error.response.data).forEach((field) =>
        setBackendValidationError(field as keyof T, {
          type: 'pattern',
        })
      );
    } else {
      onError(error);
    }
  };

  const addEmployment: ApplicationApi<T>['addEmployment'] = (
    draftApplication: DraftApplication,
    onSuccess: (application: DraftApplication) => void = noop
  ) => {
    const summer_vouchers = [...(draftApplication.summer_vouchers ?? []), {}];
    return updateApplicationQuery.mutate(
      { ...draftApplication, status: 'draft', summer_vouchers },
      {
        onSuccess: () => onSuccess(draftApplication),
        onError: handleUpdateError,
      }
    );
  };

  const removeEmployment: ApplicationApi<T>['removeEmployment'] = (
    draftApplication: DraftApplication,
    index: number,
    onSuccess: (application: DraftApplication) => void = noop
  ) => {
    const summer_vouchers = (draftApplication.summer_vouchers ?? []).filter(
      (elem, i) => i !== index
    );
    return updateApplicationQuery.mutate(
      { ...draftApplication, status: 'draft', summer_vouchers },
      {
        onSuccess: () => onSuccess(draftApplication),
        onError,
      }
    );
  };

  const updateApplication: ApplicationApi<T>['updateApplication'] = (
    draftApplication: DraftApplication,
    onSuccess = noop
  ) =>
    updateApplicationQuery.mutate(
      { ...draftApplication, status: 'draft' },
      {
        onSuccess,
        onError: handleUpdateError,
      }
    );

  const sendApplication: ApplicationApi<T>['sendApplication'] = (
    completeApplication: Application,
    onSuccess = noop
  ) =>
    updateApplicationQuery.mutate(
      { ...completeApplication, status: 'submitted' },
      {
        onSuccess: () => {
          clearLocalStorage(`application-${completeApplication.id}`);
          void queryClient.invalidateQueries(
            BackendEndpoint.EMPLOYER_APPLICATIONS
          );
          return onSuccess();
        },
        onError: handleUpdateError,
      }
    );

  return {
    isRouterLoading,
    applicationId,
    applicationQuery,
    updateApplicationQuery,
    updateApplication,
    sendApplication,
    addEmployment,
    removeEmployment,
  };
};

export default useApplicationApi;
