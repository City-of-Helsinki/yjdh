import {
  APPLICATION_STATUSES,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import useLocale from 'benefit/applicant/hooks/useLocale';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { useEffect, useState } from 'react';
import { invertBooleanArray } from 'shared/utils/array.utils';
import { capitalize } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

type ExtendedComponentProps = {
  t: TFunction;
  handleBack: () => void;
  handleSubmit: () => void;
  handleSave: () => void;
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

  const getInitialvalues = (): boolean[] =>
    application?.applicantTermsInEffect?.applicantConsents.map(() => false) ||
    [];

  const [checkedArray, setCheckedArray] = useState<boolean[]>(
    getInitialvalues()
  );

  const [errorsArray, setErrorsArray] = useState<boolean[]>(getInitialvalues());

  const { onSave, onBack } = useFormActions(application, 6);

  const { mutate: updateApplicationStep6, isSuccess: isApplicationUpdated } =
    useUpdateApplicationQuery();

  useEffect(() => {
    // todo: redirect to Thank you page, change status to received
    if (isApplicationUpdated && application.applicantTermsApproval) {
      void router.push('/');
    }
  }, [router, isApplicationUpdated, application.applicantTermsApproval]);

  const handleClick = (consentIndex: number): void => {
    const newValue = !checkedArray[consentIndex];
    const newArray = [
      ...checkedArray.slice(0, consentIndex),
      newValue,
      ...checkedArray.slice(consentIndex + 1),
    ];
    setCheckedArray(newArray);
    const newErrorsArray = [...errorsArray];
    newErrorsArray[consentIndex] = !newArray[consentIndex];
    setErrorsArray(newErrorsArray);
  };

  const getErrors = (): boolean => {
    setErrorsArray(invertBooleanArray(checkedArray));
    return checkedArray.some((c) => !c);
  };

  const getErrorText = (consentIndex: number): string =>
    errorsArray[consentIndex] ? t(VALIDATION_MESSAGE_KEYS.REQUIRED) : '';

  const handleSubmit = (): void => {
    if (!getErrors()) {
      const currentApplicationData: ApplicationData = snakecaseKeys(
        {
          ...application,
          approveTerms: {
            terms: application?.applicantTermsInEffect?.id,
            selectedApplicantConsents:
              application?.applicantTermsInEffect?.applicantConsents.map(
                (consent) => consent.id
              ),
          },
          status: APPLICATION_STATUSES.RECEIVED,
        },
        { deep: true }
      );
      // console.log(currentApplicationData);
      updateApplicationStep6(currentApplicationData);
    }
  };

  const handleSave = (): void => onSave(application);

  return {
    t,
    handleBack: onBack,
    handleSubmit,
    handleSave,
    handleClick,
    getErrorText,
    translationsBase,
    cbPrefix,
    textLocale,
    checkedArray,
  };
};

export { useApplicationFormStep6 };
