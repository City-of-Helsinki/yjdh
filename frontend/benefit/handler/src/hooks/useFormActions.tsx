import {
  APPLICATION_ACTIONS,
  APPLICATION_FIELD_KEYS,
  PAY_SUBSIDIES_OVERRIDE,
  ROUTES,
} from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import { StepActionType } from 'benefit/handler/hooks/useSteps';
import { Application } from 'benefit/handler/types/application';
import {
  APPLICATION_STATUSES,
  BENEFIT_TYPES,
  PAY_SUBSIDY_GRANTED,
  PAY_SUBSIDY_OPTIONS,
} from 'benefit-shared/constants';
import {
  ApplicationData,
  Calculation,
  Employee,
  PaySubsidy,
  TrainingCompensation,
} from 'benefit-shared/types/application';
import { prettyPrintObject } from 'benefit-shared/utils/errors';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import hdsToast from 'shared/components/toast/Toast';
import { getFullName } from 'shared/utils/application.utils';
import { convertToBackendDateFormat, parseDate } from 'shared/utils/date.utils';
import { getNumberValue, stringToFloatValue } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

import { useRouterNavigation } from './applicationHandling/useRouterNavigation';
import { useApplicationFormContext } from './useApplicationFormContext';
import useCreateApplicationQuery from './useCreateApplicationQuery';
import useDeleteApplicationQuery from './useDeleteApplicationQuery';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface FormActions {
  onNext: (
    values: Application,
    dispatchStep: React.Dispatch<StepActionType>,
    activeStep: number,
    applicationId: string | undefined,
    previousValues: Application
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

const toStringArrayRecord = (
  value: Record<string, unknown>
): Record<string, string[]> =>
  Object.fromEntries(
    Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      Array.isArray(entryValue)
        ? entryValue.map((item) => String(item))
        : [String(entryValue)],
    ])
  );

const renderEmployeeErrorLinks = (
  value: unknown,
  errorData: { data: Record<string, unknown> }
): React.ReactElement[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [
      <React.Fragment key={APPLICATION_FIELD_KEYS.EMPLOYEE}>
        {prettyPrintObject({ data: toStringArrayRecord(errorData.data) })}
      </React.Fragment>,
    ];
  }

  return Object.entries(camelcaseKeys(value)).map(([emplKey, emplValue]) => (
    <a key={emplKey} href={`#${APPLICATION_FIELD_KEYS.EMPLOYEE}.${emplKey}`}>
      {emplValue as React.ReactNode}
    </a>
  ));
};

const renderArrayErrorLinks = (
  key: string,
  value: unknown[]
): React.ReactElement[] =>
  value.map((item) => (
    <a key={`${key}-${String(item)}`} href={`#${key}`}>
      {String(item)}
    </a>
  ));

const renderGenericErrorContent = (
  key: string,
  value: unknown
): React.ReactElement =>
  typeof value === 'string' ? (
    <a key={key} href={`#${key}`}>
      {value}
    </a>
  ) : (
    <React.Fragment key={key}>
      {prettyPrintObject({
        data: toStringArrayRecord(value as Record<string, unknown>),
      })}
    </React.Fragment>
  );

const getErrorContent = (
  t: TFunction,
  errorData: {
    data: Record<string, unknown>;
  }
): React.ReactElement[] => {
  try {
    return Object.entries(errorData.data).flatMap(([key, value]) => {
      if (key === APPLICATION_FIELD_KEYS.EMPLOYEE) {
        return renderEmployeeErrorLinks(value, errorData);
      }
      if (key === 'approveTerms') {
        return [
          <p key={`${key}-${String(value)}`}>{t('common:error.terms.text')}</p>,
        ];
      }
      if (Array.isArray(value)) {
        return renderArrayErrorLinks(key, value);
      }
      return renderGenericErrorContent(key, value);
    });
  } catch (fatalError: unknown) {
    return [<p key="fatalError">Unresolved error</p>];
  }
};

const useFormActions = (
  application: Partial<Application>,
  initialApplication: Partial<Application>
): FormActions => {
  const router = useRouter();

  const { mutateAsync: createApplication, error: createApplicationError } =
    useCreateApplicationQuery();

  const { mutate: deleteApplication, error: deleteApplicationError } =
    useDeleteApplicationQuery();

  const { isFormActionNew } = useApplicationFormContext();

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
  const { navigateBack } = useRouterNavigation(application.status);

  React.useEffect(() => {
    const error =
      updateApplicationError ||
      createApplicationError ||
      deleteApplicationError;

    if (error) {
      const errorDataFromResponse = error.response?.data;
      const errorDataCamelCased = camelcaseKeys(errorDataFromResponse ?? {});

      const isContentTypeHTML = typeof errorDataFromResponse === 'string';

      let dataForGetErrorContent: Record<string, unknown>;

      if (isContentTypeHTML) {
        dataForGetErrorContent = {};
      } else {
        const potentialErrorData = errorDataCamelCased;
        dataForGetErrorContent =
          typeof potentialErrorData === 'object' &&
          potentialErrorData !== null &&
          !Array.isArray(potentialErrorData)
            ? (potentialErrorData as Record<string, unknown>)
            : {};
      }

      const errorText = isContentTypeHTML
        ? t('common:error.generic.text')
        : getErrorContent(t, {
            data: dataForGetErrorContent,
          });

      hdsToast({
        autoDismissTime: 20_000,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: errorText,
      });
    }
  }, [
    t,
    updateApplicationError,
    createApplicationError,
    deleteApplicationError,
  ]);

  const { deMinimisAids } = React.useContext(DeMinimisContext);

  const getCalculationValuesOnPaySubsidyChange = (
    values: Partial<Application>
  ): Calculation =>
    ({
      ...values.calculation,
      monthlyPay: stringToFloatValue(values.employee?.monthlyPay),
      vacationMoney: stringToFloatValue(values.employee?.vacationMoney),
      otherExpenses: stringToFloatValue(values.employee?.otherExpenses),
      stateAidMaxPercentage: values.calculation?.stateAidMaxPercentage ?? null,
      targetGroupCheck: false,
      overrideMonthlyBenefitAmount: null,
      overrideMonthlyBenefitAmountComment: '',
    } as Calculation);

  const getPayloadForCalculation = (
    values: Partial<Application>
  ): Calculation => {
    // Return the calculation values as they are
    if (
      values.paySubsidyGranted === initialApplication?.paySubsidyGranted &&
      values.apprenticeshipProgram === initialApplication?.apprenticeshipProgram
    ) {
      return {
        ...values.calculation,
        monthlyPay: stringToFloatValue(values.employee?.monthlyPay),
        otherExpenses: stringToFloatValue(values.employee?.otherExpenses),
        vacationMoney: stringToFloatValue(values.employee?.vacationMoney),
        overrideMonthlyBenefitAmount: stringToFloatValue(
          values.calculation?.overrideMonthlyBenefitAmount
        ),
      } as Calculation;
    }
    return getCalculationValuesOnPaySubsidyChange(values);
  };

  const getPayloadForPaySubsidies = (
    values: Partial<Application>
  ): PaySubsidy[] => {
    if (
      values.paySubsidyGranted === initialApplication?.paySubsidyGranted &&
      values.apprenticeshipProgram === initialApplication?.apprenticeshipProgram
    ) {
      return [...(values.paySubsidies || [])];
    }
    return [
      PAY_SUBSIDY_GRANTED.GRANTED,
      PAY_SUBSIDY_GRANTED.GRANTED_AGED,
    ].includes(values.paySubsidyGranted as PAY_SUBSIDY_GRANTED)
      ? [PAY_SUBSIDIES_OVERRIDE as unknown as PaySubsidy]
      : [];
  };

  const getPayloadForTrainingCompensations = (
    values: Partial<Application>
  ): TrainingCompensation[] => {
    if (
      values.apprenticeshipProgram &&
      values.paySubsidyGranted !== PAY_SUBSIDY_GRANTED.NOT_GRANTED
    ) {
      // Return the training compensation values as they are
      return values?.trainingCompensations || [];
    }
    return [];
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const getNormalizedValues = (currentValues: Application): Application => {
    const employee: Employee | undefined = currentValues?.employee ?? undefined;

    const {
      paySubsidyGranted,
      startDate,
      endDate,
      apprenticeshipProgram,
      paperApplicationDate,
      changeReason,
      calculation,
      paySubsidies,
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
      paySubsidyPercent,
      deMinimisAid: deMinimisAids.length > 0,
      employee: employee || {},
      startDate: startDate
        ? convertToBackendDateFormat(parseDate(startDate))
        : undefined,
      endDate: endDate
        ? convertToBackendDateFormat(parseDate(endDate))
        : undefined,
      paperApplicationDate: paperApplicationDate
        ? convertToBackendDateFormat(parseDate(paperApplicationDate))
        : undefined,
      apprenticeshipProgram:
        paySubsidyGranted === PAY_SUBSIDY_GRANTED.NOT_GRANTED
          ? null
          : apprenticeshipProgram,
    };

    return {
      ...application,
      ...normalizedValues,
      changeReason,
      deMinimisAidSet: deMinimisAids,
      action: APPLICATION_ACTIONS.HANDLER_ALLOW_APPLICATION_EDIT,
      benefitType: BENEFIT_TYPES.SALARY,
      trainingCompensations: normalizedValues.trainingCompensations
        ? getPayloadForTrainingCompensations(currentValues)
        : undefined,
      calculation: calculation
        ? getPayloadForCalculation(currentValues)
        : undefined,
      paySubsidies: paySubsidies
        ? getPayloadForPaySubsidies(currentValues)
        : undefined,
    };
  };

  const prepareDataForSubmission = (
    values: Partial<Application>
  ): ApplicationData =>
    snakecaseKeys(values, { deep: true }) as ApplicationData;

  const onSubmit = async (
    currentValues: Application,
    applicationId: string | undefined
  ): Promise<ApplicationData | void> => {
    const values = { ...currentValues };
    values.status = APPLICATION_STATUSES.RECEIVED;
    values.approveTerms = {
      terms: application?.applicantTermsInEffect?.id || '',
      selectedApplicantConsents:
        application?.applicantTermsInEffect?.applicantConsents.map(
          (consent) => consent.id
        ) || [],
    };
    const data = prepareDataForSubmission(getNormalizedValues(values));

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
      await router.push(`${ROUTES.APPLICATION}?id=${applicationId}`);
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  const onNext = async (
    currentValues: Application,
    dispatchStep: React.Dispatch<StepActionType>,
    activeStep: number,
    applicationId: string | undefined
  ): Promise<ApplicationData | void> => {
    const data = prepareDataForSubmission(getNormalizedValues(currentValues));
    try {
      const result = applicationId
        ? await updateApplication(data)
        : await createApplicationAndAppendId(data);
      if (isFormActionNew) {
        dispatchStep({ type: 'completeStep', payload: activeStep });
      } else {
        void router.push(
          `${ROUTES.APPLICATION}?id=${applicationId}&action=update`
        );
      }

      return result;
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  const onBack = async (): Promise<ApplicationData | void> => {
    const data = prepareDataForSubmission(application);

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
    const data = prepareDataForSubmission(getNormalizedValues(currentValues));
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
    const data = prepareDataForSubmission(getNormalizedValues(currentValues));
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
      await navigateBack();

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
    const data = prepareDataForSubmission(getNormalizedValues(currentValues));
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
