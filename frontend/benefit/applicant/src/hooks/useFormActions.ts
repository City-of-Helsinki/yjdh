import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import hdsToast from 'shared/components/toast/Toast';
import { DATE_FORMATS, formatDate, parseDate } from 'shared/utils/date.utils';
import snakecaseKeys from 'snakecase-keys';

import DeMinimisContext from '../context/DeMinimisContext';
import { Application, ApplicationData } from '../types/application';
import { getApplicationStepString } from '../utils/common';
import useCreateApplicationQuery from './useCreateApplicationQuery';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface FormActions {
  handleNext: (values: Application) => void;
  handleBack: () => void;
  handleSave: (values: Application) => void;
}

export const useFormActions = (
  application: Application,
  currentStep: number
): FormActions => {
  const router = useRouter();

  const {
    mutate: createApplication,
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

  const { mutate: updateApplication, error: updateApplicationError } =
    useUpdateApplicationQuery();

  const { t } = useTranslation();

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationError || createApplicationError) {
      hdsToast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
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
        ? formatDate(
            parseDate(currentValues.startDate),
            DATE_FORMATS.DATE_BACKEND
          )
        : undefined,
      endDate: currentValues.endDate
        ? formatDate(
            parseDate(currentValues.endDate),
            DATE_FORMATS.DATE_BACKEND
          )
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

  const handleNext = (currentValues: Application): void => {
    const data = getData(getModifiedValues(currentValues), currentStep + 1);
    return applicationId ? updateApplication(data) : createApplication(data);
  };

  const handleBack = (): void => {
    const data = getData(application, currentStep - 1);
    return updateApplication(data);
  };

  const handleSave = (currentValues: Application): void => {
    const data = getData(getModifiedValues(currentValues), currentStep);
    return applicationId ? updateApplication(data) : createApplication(data);
  };

  return {
    handleNext,
    handleBack,
    handleSave,
  };
};
