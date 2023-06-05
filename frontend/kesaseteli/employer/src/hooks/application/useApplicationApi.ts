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
import { EmploymentBase } from 'shared/types/employment';
import { omit } from 'lodash';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { useTranslation } from 'react-i18next';
import useEmploymentQuery from 'kesaseteli/employer/hooks/backend/useEmploymentQuery';

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
  fetchEmployment: (
    application: DraftApplication,
    employmentIndex: number
  ) => void;
  addEmployment: (
    application: DraftApplication,
    onSuccess?: () => void | Promise<void>
  ) => void;
  updateEmployment: (
    application: DraftApplication,
    index: number,
    employment: EmploymentBase,
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
  const { t } = useTranslation();
  const getEmploymentQuery = useEmploymentQuery();

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

  const fetchEmployment: ApplicationApi<T>['fetchEmployment'] = (
    draftApplication: DraftApplication,
    employmentIndex: number
  ) => {
    const formDataVoucher = draftApplication.summer_vouchers[employmentIndex];
    getEmploymentQuery.mutate(
      {
        employee_name: formDataVoucher.employee_name,
        summer_voucher_serial_number:
          formDataVoucher.summer_voucher_serial_number,
        employer_summer_voucher_id: formDataVoucher.id,
      },
      {
        onSuccess: (data) =>
          updateEmployment(
            draftApplication,
            employmentIndex,
            omit(data, 'employer_summer_voucher_id')
          ),
        onError: () =>
          showErrorToast(
            t('common:application.step2.fetch_employment_error_title'),
            t('common:application.step2.fetch_employment_error_message')
          ),
      }
    );
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

  const updateEmployment: ApplicationApi<T>['updateEmployment'] = (
    draftApplication: DraftApplication,
    index: number,
    employment: EmploymentBase,
    onSuccess: (application: DraftApplication) => void = noop
  ) => {
    const summer_vouchers = [...(draftApplication.summer_vouchers ?? [])];
    if (summer_vouchers.length > index) {
      summer_vouchers[index] = { ...summer_vouchers[index], ...employment };
    }

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
    fetchEmployment,
    addEmployment,
    updateEmployment,
    removeEmployment,
  };
};

export default useApplicationApi;
