import { APPLICATION_STATUSES, ROUTES } from 'benefit/applicant/constants';
import AppContext from 'benefit/applicant/context/AppContext';
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
import { useContext, useEffect, useState } from 'react';
import { getFullName } from 'shared/utils/application.utils';
import { invertBooleanArray } from 'shared/utils/array.utils';
import { capitalize } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';
import { VALIDATION_MESSAGE_KEYS } from 'benefit-shared/constants';

type ExtendedComponentProps = {
  t: TFunction;
  handleBack: () => void;
  handleSubmit: () => void;
  handleSave: () => void;
  handleDelete: () => void;
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

  const { onSave, onBack, onDelete } = useFormActions(application);

  const { setSubmittedApplication, submittedApplication } =
    useContext(AppContext);

  const { mutate: updateApplicationStep6, isSuccess: isApplicationUpdated } =
    useUpdateApplicationQuery();

  useEffect(() => {
    if (
      isApplicationUpdated &&
      (application.status === APPLICATION_STATUSES.RECEIVED ||
        application.status === APPLICATION_STATUSES.HANDLING)
    ) {
      setSubmittedApplication({
        applicantName: getFullName(
          application.employee?.firstName,
          application.employee?.lastName
        ),
        applicationNumber: application.applicationNumber || 0,
      });
    }
  }, [isApplicationUpdated, application, setSubmittedApplication]);

  useEffect(() => {
    if (submittedApplication) {
      void router.push(ROUTES.HOME);
    }
  }, [router, submittedApplication]);

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
          status:
            application.status === APPLICATION_STATUSES.DRAFT
              ? APPLICATION_STATUSES.RECEIVED
              : APPLICATION_STATUSES.HANDLING,
        },
        { deep: true }
      );
      updateApplicationStep6(currentApplicationData);
    }
  };

  const handleSave = (): void => onSave(application);
  const handleDelete = (): void => onDelete(application.id ?? '');

  return {
    t,
    handleBack: onBack,
    handleSubmit,
    handleSave,
    handleDelete,
    handleClick,
    getErrorText,
    translationsBase,
    cbPrefix,
    textLocale,
    checkedArray,
  };
};

export { useApplicationFormStep6 };
