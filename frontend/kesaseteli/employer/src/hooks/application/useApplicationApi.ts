import useApplicationQuery from 'kesaseteli/employer/hooks/backend/useApplicationQuery';
import useUpdateApplicationQuery from 'kesaseteli/employer/hooks/backend/useUpdateApplicationQuery';
import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';
import React from 'react';
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

const useApplicationApi = <T = Application>(
  select?: (application: Application) => T
): ApplicationApi<T> => {
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');
  const queryClient = useQueryClient();
  const onError = useErrorHandler();

  const applicationQuery = useApplicationQuery<T>(applicationId, select);
  const updateApplicationQuery = useUpdateApplicationQuery(applicationId);

  const addEmployment: ApplicationApi<T>['addEmployment'] = React.useCallback(
    (
      draftApplication: DraftApplication,
      onSuccess: (application: DraftApplication) => void = noop
    ) => {
      const summer_vouchers = [...(draftApplication.summer_vouchers ?? []), {}];
      return updateApplicationQuery.mutate(
        { ...draftApplication, status: 'draft', summer_vouchers },
        {
          onSuccess: () => onSuccess(draftApplication),
          onError,
        }
      );
    },
    [updateApplicationQuery, onError]
  );

  const removeEmployment: ApplicationApi<T>['removeEmployment'] =
    React.useCallback(
      (
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
      },
      [updateApplicationQuery, onError]
    );

  const updateApplication: ApplicationApi<T>['updateApplication'] =
    React.useCallback(
      (draftApplication: DraftApplication, onSuccess = noop) => {
        return updateApplicationQuery.mutate(
          { ...draftApplication, status: 'draft' },
          {
            onSuccess,
            onError,
          }
        );
      },
      [updateApplicationQuery, addEmployment, onError]
    );

  const sendApplication: ApplicationApi<T>['sendApplication'] =
    React.useCallback(
      (completeApplication: Application, onSuccess = noop) =>
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
            onError,
          }
        ),
      [queryClient, updateApplicationQuery, onError]
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
