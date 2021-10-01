import {
  APPLICATION_STATUSES,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import useLocale from 'benefit/applicant/hooks/useLocale';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import some from 'lodash/some';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { useEffect, useState } from 'react';
import hdsToast from 'shared/components/toast/Toast';
import { invertBooleanArray } from 'shared/utils/array.utils';
import { capitalize } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

type ExtendedComponentProps = {
  t: TFunction;
  handleBack: () => void;
  handleSubmit: () => void;
  handleStepChange: (step: number) => void;
  handleClick: (consentIndex: number) => void;
  getErrorText: (consentIndex: number) => string;
  translationsBase: string;
  cbPrefix: string;
  textLocale: string;
  checkedArray: boolean[];
};

const useApplicationFormStep6 = (
  application: Application
): ExtendedComponentProps => {
  const translationsBase = 'common:applications.sections.send';
  const { t } = useTranslation();
  const router = useRouter();

  const locale = useLocale();
  const textLocale = capitalize(locale);
  const cbPrefix = 'application_consent';

  const getInitialvalues = (): boolean[] => (
      application?.applicantTermsInEffect?.applicantConsents.map(() => false) ||
      []
    );

  const [checkedArray, setCheckedArray] = useState<boolean[]>(
    getInitialvalues()
  );

  const [errorsArray, setErrorsArray] = useState<boolean[]>(getInitialvalues());

  const {
    mutate: updateApplicationStep6,
    error: updateApplicationErrorStep6,
    isSuccess: isApplicationUpdated,
  } = useUpdateApplicationQuery();

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationErrorStep6) {
      hdsToast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationErrorStep6]);

  useEffect(() => {
    // todo: redirect to Thank you page, change status to received
    void router.push('/');
  }, [router, isApplicationUpdated]);

  const handleClick = (consentIndex: number): void => {
    const newValue = !checkedArray[consentIndex];
    const newArray = [
      ...checkedArray.slice(0, consentIndex),
      newValue,
      ...checkedArray.slice(consentIndex + 1),
    ];
    setCheckedArray(newArray);
    setErrorsArray(invertBooleanArray(newArray));
  };

  const handleStepChange = (nextStep: number): void => {
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        applicationStep: getApplicationStepString(nextStep),
      },
      { deep: true }
    );
    updateApplicationStep6(currentApplicationData);
  };

  const handleBack = (): void => handleStepChange(5);

  const getErrors = (): boolean => {
    setErrorsArray(invertBooleanArray(checkedArray));
    return some(checkedArray, false);
  };

  const getErrorText = (consentIndex: number): string =>
    errorsArray[consentIndex] ? t(VALIDATION_MESSAGE_KEYS.REQUIRED) : '';

  const handleSubmit = (): void => {
    if (!getErrors()) {
      const currentApplicationData: ApplicationData = snakecaseKeys(
        {
          ...application,
          approveTerms: {
            terms: 'id',
            selectedApplicantConsents: ['id1', 'id2', 'id3'],
          },
          status: APPLICATION_STATUSES.RECEIVED,
        },
        { deep: true }
      );
      // console.log(currentApplicationData);
      updateApplicationStep6(currentApplicationData);
    }
  };

  return {
    t,
    handleBack,
    handleSubmit,
    handleStepChange,
    handleClick,
    getErrorText,
    translationsBase,
    cbPrefix,
    textLocale,
    checkedArray,
  };
};

export { useApplicationFormStep6 };
