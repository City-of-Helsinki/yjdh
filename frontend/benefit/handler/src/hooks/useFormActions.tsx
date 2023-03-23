import { APPLICATION_FIELD_KEYS } from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import { StepActionType } from 'benefit/handler/hooks/useSteps';
import { Application } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationData, Employee } from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import hdsToast from 'shared/components/toast/Toast';
import { getFullName } from 'shared/utils/application.utils';
import { convertToBackendDateFormat, parseDate } from 'shared/utils/date.utils';
import { getNumberValue, stringToFloatValue } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

import useCreateApplicationQuery from './useCreateApplicationQuery';
import useDeleteApplicationQuery from './useDeleteApplicationQuery';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface FormActions {
  onNext: (
    values: Application,
    applicationId: string | undefined,
    dispatchStep: React.Dispatch<StepActionType>,
    activeStep: number
  ) => Promise<ApplicationData | void>;
  onSubmit: (
    values: Application,
    applicationId: string | undefined
  ) => Promise<ApplicationData | void>;
  onBack: () => Promise<ApplicationData | void>;
  onSave: (
    values: Partial<Application>,
    applicationId: string | undefined
  ) => Promise<ApplicationData | void>;
  onQuietSave: (
    values: Partial<Application>,
    applicationId: string | undefined
  ) => Promise<ApplicationData | void>;
  onDelete: (id: string) => void;
  onCompanySelected: (
    values: Partial<Application>
  ) => Promise<ApplicationData | void>;
}

const useFormActions = (application: Partial<Application>): FormActions => {
  const router = useRouter();

  const { mutateAsync: createApplication, error: createApplicationError } =
    useCreateApplicationQuery();

  const { mutate: deleteApplication, error: deleteApplicationError } =
    useDeleteApplicationQuery();

  const createApplicationAndAppendId = async (
    data: ApplicationData
  ): Promise<void> => {
    const newApplication = await createApplication(data);
    void router.replace({
      query: {
        id: newApplication?.id,
      },
    });
  };

  const { mutateAsync: updateApplication, error: updateApplicationError } =
    useUpdateApplicationQuery();

  const { t } = useTranslation();

  React.useEffect(() => {
    const error =
      updateApplicationError ||
      createApplicationError ||
      deleteApplicationError;

    if (error) {
      const errorData = camelcaseKeys(error.response?.data ?? {});
      const isContentTypeHTML = typeof errorData === 'string';
      hdsToast({
        autoDismissTime: 0,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: isContentTypeHTML
          ? t('common:error.generic.text')
          : Object.entries(errorData).map(([key, value]) => {
              if (key === APPLICATION_FIELD_KEYS.EMPLOYEE) {
                return Object.entries(camelcaseKeys(value)).map(
                  ([emplKey, emplValue]) => (
                    <a
                      key={emplKey}
                      href={`#${APPLICATION_FIELD_KEYS.EMPLOYEE}.${emplKey}`}
                    >
                      {emplValue}
                    </a>
                  )
                )[0];
              }
              return (
                <a key={key} href={`#${key}`}>
                  {value}
                </a>
              );
            }),
      });
    }
  }, [
    t,
    updateApplicationError,
    createApplicationError,
    deleteApplicationError,
  ]);

  const { deMinimisAids } = React.useContext(DeMinimisContext);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const getModifiedValues = (currentValues: Application): Application => {
    const employee: Employee | undefined = currentValues?.employee ?? undefined;
    if (employee) {
      employee.commissionAmount = employee.commissionAmount
        ? String(getNumberValue(employee.commissionAmount.toString()))
        : undefined;
      employee.workingHours = employee.workingHours
        ? String(getNumberValue(employee.workingHours.toString()))
        : undefined;
      employee.monthlyPay = employee.monthlyPay
        ? String(getNumberValue(employee.monthlyPay.toString()))
        : undefined;
      employee.otherExpenses = employee.otherExpenses
        ? String(getNumberValue(employee.otherExpenses.toString()))
        : undefined;
      employee.vacationMoney = employee.vacationMoney
        ? String(getNumberValue(employee.vacationMoney.toString()))
        : undefined;
    }

    const normalizedValues = {
      ...currentValues,
      employee: employee || {},
      startDate: currentValues.startDate
        ? convertToBackendDateFormat(parseDate(currentValues.startDate))
        : undefined,
      endDate: currentValues.endDate
        ? convertToBackendDateFormat(parseDate(currentValues.endDate))
        : undefined,
      apprenticeshipProgram: currentValues.apprenticeshipProgram,
    };

    const deMinimisAidSet =
      deMinimisAids.length > 0
        ? deMinimisAids
        : currentValues.deMinimisAidSet ?? [];

    return {
      ...application,
      ...normalizedValues,
      deMinimisAidSet,
    };
  };

  const getData = (values: Partial<Application>): ApplicationData =>
    snakecaseKeys(
      {
        ...values,
        calculation: values.calculation
          ? {
              ...values.calculation,
              monthlyPay: stringToFloatValue(values.calculation.monthlyPay),
              otherExpenses: stringToFloatValue(
                values.calculation.otherExpenses
              ),
              vacationMoney: stringToFloatValue(
                values.calculation.vacationMoney
              ),
              overrideMonthlyBenefitAmount: stringToFloatValue(
                values.calculation.overrideMonthlyBenefitAmount
              ),
            }
          : undefined,
      },
      { deep: true }
    ) as ApplicationData;

  const onSubmit = async (
    currentValues: Application,
    applicationId: string | undefined
  ): Promise<ApplicationData | void> => {
    const values = { ...currentValues };
    values.status = APPLICATION_STATUSES.RECEIVED;
    values.approveTerms = {
      terms: application?.applicantTermsInEffect?.id,
      selectedApplicantConsents:
        application?.applicantTermsInEffect?.applicantConsents.map(
          (consent) => consent.id
        ),
    };
    const data = getData(getModifiedValues(values));

    try {
      const result = applicationId
        ? await updateApplication(data)
        : await createApplication(data);
      const fullName = getFullName(
        result?.employee?.first_name,
        result?.employee?.last_name
      );
      const applicantName = fullName ? `(${fullName})` : '';
      const applicationNumber = result?.application_number ?? '';

      hdsToast({
        autoDismissTime: 5000,
        type: 'success',
        labelText: t('common:notifications.applicationSubmitted.label'),
        text: t('common:notifications.applicationSubmitted.message', {
          applicationNumber,
          applicantName,
        }),
      });
      await router.push(`application?id=${applicationId}`);
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  const onNext = async (
    currentValues: Application,
    applicationId: string | undefined,
    dispatchStep: React.Dispatch<StepActionType>,
    activeStep: number
  ): Promise<ApplicationData | void> => {
    const data = getData(getModifiedValues(currentValues));

    try {
      const result = applicationId
        ? await updateApplication(data)
        : await createApplicationAndAppendId(data);
      dispatchStep({ type: 'completeStep', payload: activeStep });
      return result;
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  const onBack = async (): Promise<ApplicationData | void> => {
    const data = getData(application);

    try {
      return await updateApplication(data);
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  const onQuietSave = async (
    currentValues: Application,
    applicationId: string | undefined
  ): Promise<ApplicationData | void> => {
    const data = getData(getModifiedValues(currentValues));
    try {
      return applicationId
        ? await updateApplication(data)
        : await createApplication(data);
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  const onSave = async (
    currentValues: Application,
    applicationId: string | undefined
  ): Promise<ApplicationData | void> => {
    const data = getData(getModifiedValues(currentValues));

    try {
      const result = applicationId
        ? await updateApplication(data)
        : await createApplication(data);

      const fullName = getFullName(
        result?.employee?.first_name,
        result?.employee?.last_name
      );
      const applicantName = fullName ? `(${fullName})` : '';
      const applicationNumber = result?.application_number ?? '';

      hdsToast({
        autoDismissTime: 5000,
        type: 'success',
        labelText: t('common:notifications.applicationSaved.label'),
        text: t('common:notifications.applicationSaved.message', {
          applicationNumber,
          applicantName,
        }),
      });

      await router.push('/');
      return result;
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  const onDelete = (id: string): void => {
    deleteApplication(id, {
      onSuccess: () => {
        hdsToast({
          autoDismissTime: 5000,
          type: 'success',
          labelText: t('common:notifications.applicationDeleted.label'),
          text: t('common:notifications.applicationDeleted.message'),
        });
        return router.push('/');
      },
    });
  };

  const onCompanySelected = async (
    currentValues: Partial<Application>
  ): Promise<ApplicationData | void> => {
    const data = getData(getModifiedValues(currentValues));
    return createApplicationAndAppendId(data);
  };

  return {
    onNext,
    onBack,
    onSave,
    onQuietSave,
    onSubmit,
    onDelete,
    onCompanySelected,
  };
};

export default useFormActions;
