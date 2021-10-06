import { useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import hdsToast from 'shared/components/toast/Toast';
import { convertToBackendDateFormat, parseDate } from 'shared/utils/date.utils';
import snakecaseKeys from 'snakecase-keys';

import DeMinimisContext from '../context/DeMinimisContext';
import { Application, ApplicationData } from '../types/application';
import { getApplicationStepString } from '../utils/common';
import useCreateApplicationQuery from './useCreateApplicationQuery';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface FormActions {
  onNext: (values: Application) => void;
  onBack: () => void;
  onSave: (values: Application) => void;
}

export const useFormActions = (
  application: Application,
  currentStep: number
): FormActions => {
  const router = useRouter();

  const {
    mutateAsync: createApplication,
    data: newApplication,
    error: createApplicationError,
  } = useCreateApplicationQuery();

  useEffect(() => {
    if (newApplication?.id) {
      void router.replace({
        query: {
          id: newApplication.id,
        },
      });
    }
  }, [newApplication?.id, router]);

  const applicationId = router.query.id;

  const { mutateAsync: updateApplication, error: updateApplicationError } =
    useUpdateApplicationQuery();

  const { t } = useTranslation();

  useEffect(() => {
    // todo:custom error messages
    const error = updateApplicationError || createApplicationError;

    if (error) {
      hdsToast({
        autoDismissTime: 0,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationError, createApplicationError]);

  const { deMinimisAids } = useContext(DeMinimisContext);

  const getModifiedValues = (currentValues: Application): Application => {
    const normalizedValues = {
      ...currentValues,
      startDate: currentValues.startDate
        ? convertToBackendDateFormat(parseDate(currentValues.startDate))
        : undefined,
      endDate: currentValues.endDate
        ? convertToBackendDateFormat(parseDate(currentValues.endDate))
        : undefined,
    };

    const deMinimisAidValues = {
      // update from context
      deMinimisAidSet: deMinimisAids,
      deMinimisAid: deMinimisAids?.length !== 0,
    };

    return {
      ...application,
      ...normalizedValues,
      ...deMinimisAidValues,
    };
  };

  const getData = (values: Application, step: number): ApplicationData =>
    snakecaseKeys(
      {
        ...values,
        applicationStep: getApplicationStepString(step),
      },
      { deep: true }
    );

  const onNext = async (
    currentValues: Application
  ): Promise<ApplicationData | void> => {
    const data = getData(getModifiedValues(currentValues), currentStep + 1);

    try {
      return applicationId
        ? await updateApplication(data)
        : await createApplication(data);
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

      await router.push('/');
      return result;
    } catch (error) {
      // useEffect will catch this error
    }
    return undefined;
  };

  return {
    onNext,
    onBack,
    onSave,
  };
};
