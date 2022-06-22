import useFormActions from 'benefit/applicant/hooks/useFormActions';
import useLocale from 'benefit/applicant/hooks/useLocale';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  APPLICATION_STATUSES,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import {
  Application,
  ApplicationData,
  TermsProp,
} from 'benefit-shared/types/application';
import { TFunction } from 'next-i18next';
import React, { useState } from 'react';
import { invertBooleanArray } from 'shared/utils/array.utils';
import { capitalize, stringToFloatValue } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

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
  applicantTermsInEffectUrl: string;
};

const useApplicationFormStep6 = (
  application: Application,
  onSubmit?: () => void
): ExtendedComponentProps => {
  const translationsBase = 'common:applications.sections.send';
  const { t } = useTranslation();
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

  const { mutate: updateApplicationStep6 } = useUpdateApplicationQuery();

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
      const currentApplicationData = snakecaseKeys(
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
          calculation: application.calculation
            ? {
                ...application.calculation,
                monthlyPay: stringToFloatValue(
                  application.calculation.monthlyPay
                ),
                otherExpenses: stringToFloatValue(
                  application.calculation.otherExpenses
                ),
                vacationMoney: stringToFloatValue(
                  application.calculation.vacationMoney
                ),
                overrideMonthlyBenefitAmount: stringToFloatValue(
                  application.calculation.overrideMonthlyBenefitAmount
                ),
              }
            : undefined,
        },
        { deep: true }
      ) as ApplicationData;
      if (onSubmit) {
        onSubmit();
      }
      updateApplicationStep6(currentApplicationData);
    }
  };

  const handleSave = (): void => {
    void onSave(application);
  };
  const handleDelete = (): void => {
    void onDelete(application.id ?? '');
  };

  const applicantTermsInEffectUrl = React.useMemo(() => {
    if (
      application.applicantTermsInEffect &&
      application.applicantTermsInEffect[`termsPdf${textLocale}` as TermsProp]
    )
      return application.applicantTermsInEffect[
        `termsPdf${textLocale}` as TermsProp
      ];
    return '';
  }, [application.applicantTermsInEffect, textLocale]);

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
    applicantTermsInEffectUrl,
  };
};

export { useApplicationFormStep6 };
