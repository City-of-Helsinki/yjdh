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

export type ApplicationApi<T> = {
  applicationId?: string;
  applicationQuery: UseQueryResult<T, Error>;
  updateApplicationQuery: UseMutationResult<
    Application,
    Error,
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
  const applicationId = useApplicationIdQueryParam();

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
        }
      );
    },
    [updateApplicationQuery]
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
          }
        );
      },
      [updateApplicationQuery]
    );

  const updateApplication: ApplicationApi<T>['updateApplication'] =
    React.useCallback(
      (draftApplication: DraftApplication, onSuccess = noop) => {
        if (isEmpty(draftApplication.summer_vouchers)) {
          return addEmployment(draftApplication, onSuccess);
        }
        return updateApplicationQuery.mutate(
          { ...draftApplication, status: 'draft' },
          {
            onSuccess,
          }
        );
      },
      [updateApplicationQuery, addEmployment]
    );

  const sendApplication: ApplicationApi<T>['sendApplication'] =
    React.useCallback(
      (completeApplication: Application, onSuccess = noop) =>
        updateApplicationQuery.mutate(
          { ...completeApplication, status: 'submitted' },
          {
            onSuccess: () => {
              clearLocalStorage(`application-${completeApplication.id}`);
              return onSuccess();
            },
          }
        ),
      [updateApplicationQuery]
    );

  return {
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
