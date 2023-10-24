import { useTranslation } from 'benefit/applicant/i18n';
import {
  getApplicationStepFromString,
  getApplicationStepString,
} from 'benefit/applicant/utils/common';
import {
  BENEFIT_TYPES,
  PAY_SUBSIDY_GRANTED,
  PAY_SUBSIDY_OPTIONS,
} from 'benefit-shared/constants';
import {
  Application,
  ApplicationData,
  Employee,
} from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import hdsToast from 'shared/components/toast/Toast';
import { getFullName } from 'shared/utils/application.utils';
import { convertToBackendDateFormat, parseDate } from 'shared/utils/date.utils';
import { getNumberValue, stringToFloatValue } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

import DeMinimisContext from '../context/DeMinimisContext';
import useCreateApplicationQuery from './useCreateApplicationQuery';
import useDeleteApplicationQuery from './useDeleteApplicationQuery';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface FormActions {
  onNext: (values: Application) => Promise<ApplicationData | void>;
  onBack: () => Promise<ApplicationData | void>;
  onSave: (values: Partial<Application>) => Promise<ApplicationData | void>;
  onDelete: (id: string) => void;
}

const prettyPrintObject = (object: Record<string, string[]>): string =>
  JSON.stringify(object)
    .replace(/["[\]{}]/g, '')
    .replace(/:/g, ': ')
    .replace(/,/g, '\n');

const useFormActions = (application: Partial<Application>): FormActions => {
  const router = useRouter();
  const currentStep = getApplicationStepFromString(
    application.applicationStep ?? ''
  );

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

  const applicationId = router.query.id;

  const { mutateAsync: updateApplication, error: updateApplicationError } =
    useUpdateApplicationQuery();

  const { t } = useTranslation();

  useEffect(() => {
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
          : Object.entries(errorData).map(([key, value]) =>
              typeof value === 'string' ? (
                <a key={key} href={`#${key}`}>
                  {value}
                </a>
              ) : (
                prettyPrintObject(value)
              )
            ),
      });
    }
  }, [
    t,
    updateApplicationError,
    createApplicationError,
    deleteApplicationError,
  ]);

  const { deMinimisAids } = useContext(DeMinimisContext);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const getModifiedValues = (currentValues: Application): Application => {
    const employee: Employee | undefined = currentValues?.employee ?? undefined;
    const {
      paySubsidyGranted,
      startDate,
      endDate,
      apprenticeshipProgram,
      deMinimisAidSet,
    } = currentValues;
    const paySubsidyPercent =
      paySubsidyGranted === PAY_SUBSIDY_GRANTED.NOT_GRANTED
        ? null
        : PAY_SUBSIDY_OPTIONS[0];

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
      employee,
      paySubsidyPercent,
      startDate: startDate
        ? convertToBackendDateFormat(parseDate(startDate))
        : undefined,
      endDate: endDate
        ? convertToBackendDateFormat(parseDate(endDate))
        : undefined,
      apprenticeshipProgram,
    };

    // Use context on first step, otherwise pass data from backend
    const deMinimisAidData =
      currentStep === 1 ? deMinimisAids : deMinimisAidSet;

    return {
      ...application,
      ...normalizedValues,
      deMinimisAidSet: deMinimisAidData,
      benefitType: BENEFIT_TYPES.SALARY,
      coOperationNegotiationsDescription: application.coOperationNegotiations
        ? application.coOperationNegotiationsDescription
        : '',
      deMinimisAid: deMinimisAidData.length > 0,
    };
  };

  const getData = (
    values: Partial<Application>,
    step: number
  ): ApplicationData =>
    snakecaseKeys(
      {
        ...values,
        applicationStep: getApplicationStepString(step),
        benefit_type: BENEFIT_TYPES.SALARY,
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

  const onNext = async (
    currentValues: Application
  ): Promise<ApplicationData | void> => {
    const data = getData(getModifiedValues(currentValues), currentStep + 1);

    try {
      return applicationId
        ? await updateApplication(data)
        : await createApplicationAndAppendId(data);
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  const onBack = async (): Promise<ApplicationData | void> => {
    const data = getData(application, currentStep - 1);

    try {
      return await updateApplication(data);
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  const onSave = async (
    currentValues: Application
  ): Promise<ApplicationData | void> => {
    const data = getData(getModifiedValues(currentValues), currentStep);

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

  return {
    onNext,
    onBack,
    onSave,
    onDelete,
  };
};

export default useFormActions;
