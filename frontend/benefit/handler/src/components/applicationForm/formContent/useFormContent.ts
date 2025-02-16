import { APPLICATION_START_DATE_WITHIN_MONTHS } from 'benefit/applicant/src/constants';
import { SUPPORTED_LANGUAGES } from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import { getErrorText } from 'benefit-shared/utils/forms';
import { addYears } from 'date-fns';
import parse from 'date-fns/parse';
import { FormikProps } from 'formik';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';
import { OptionType } from 'shared/types/common';
import { getLanguageOptions } from 'shared/utils/common';
import { diffMonths } from 'shared/utils/date.utils';
import { capitalize } from 'shared/utils/string.utils';

type ExtendedComponentProps = {
  t: TFunction;
  language: SUPPORTED_LANGUAGES;
  translationsBase: string;
  languageOptions: OptionType[];
  cbPrefix: string;
  textLocale: string;
  clearDeminimisAids: () => void;
  clearBenefitValues: () => void;
  clearCommissionValues: () => void;
  clearContractValues: () => void;
  clearDatesValues: () => void;
  clearAlternativeAddressValues: () => void;
  getErrorMessage: (fieldName: string) => string | undefined;
  displayPastApplicationDatesWarning: () => boolean;
  dateInputLimits: {
    max: Date;
    min: Date;
  };
};

const useFormContent = (
  formik: FormikProps<Partial<Application>>,
  fields: ApplicationFields
): ExtendedComponentProps => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections';
  const cbPrefix = 'application_consent';
  const { setDeMinimisAids } = React.useContext(DeMinimisContext);
  const { touched, errors, setFieldValue, values } = formik;

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'languages'),
    [t]
  );

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(errors, touched, fieldName, t, false);

  const clearAlternativeAddressValues = React.useCallback((): void => {
    setFieldValue(fields.companyDepartment.name, '');
    setFieldValue(fields.alternativeCompanyStreetAddress.name, '');
    setFieldValue(fields.alternativeCompanyPostcode.name, '');
    setFieldValue(fields.alternativeCompanyCity.name, '');
  }, [
    fields.companyDepartment.name,
    fields.alternativeCompanyStreetAddress.name,
    fields.alternativeCompanyPostcode.name,
    fields.alternativeCompanyCity.name,
    setFieldValue,
  ]);

  const clearDeminimisAids = React.useCallback((): void => {
    setDeMinimisAids([]);
    setFieldValue(fields.deMinimisAid.name, null);
  }, [fields.deMinimisAid.name, setDeMinimisAids, setFieldValue]);

  const clearCommissionValues = React.useCallback((): void => {
    setFieldValue(fields.employee.commissionDescription.name, '');
    setFieldValue(fields.employee.commissionAmount.name, '');
  }, [
    fields.employee.commissionDescription.name,
    fields.employee.commissionAmount.name,
    setFieldValue,
  ]);

  const clearContractValues = React.useCallback((): void => {
    setFieldValue(fields.employee.jobTitle.name, '');
    setFieldValue(fields.employee.workingHours.name, '');
    setFieldValue(fields.employee.collectiveBargainingAgreement.name, '');
    setFieldValue(fields.employee.monthlyPay.name, '');
    setFieldValue(fields.employee.otherExpenses.name, '');
    setFieldValue(fields.employee.vacationMoney.name, '');
  }, [
    fields.employee.jobTitle.name,
    fields.employee.workingHours.name,
    fields.employee.collectiveBargainingAgreement.name,
    fields.employee.monthlyPay.name,
    fields.employee.otherExpenses.name,
    fields.employee.vacationMoney.name,
    setFieldValue,
  ]);

  const clearDatesValues = React.useCallback((): void => {
    setFieldValue(fields.startDate.name, '');
    setFieldValue(fields.endDate.name, '');
  }, [fields.startDate.name, fields.endDate.name, setFieldValue]);

  const clearBenefitValues = React.useCallback((): void => {
    setFieldValue(fields.benefitType.name, null);
  }, [fields.benefitType.name, setFieldValue]);

  const displayPastApplicationDatesWarning = (): boolean => {
    const { startDate, endDate } = values;
    if (!startDate || !endDate) {
      return false;
    }

    const parsedStartDate = parse(startDate, 'd.M.yyyy', new Date());
    const parsedEndDate = parse(endDate, 'd.M.yyyy', new Date());

    return (
      diffMonths(new Date(), parsedStartDate) >
        APPLICATION_START_DATE_WITHIN_MONTHS ||
      diffMonths(new Date(), parsedEndDate) >
        APPLICATION_START_DATE_WITHIN_MONTHS
    );
  };

  const language = SUPPORTED_LANGUAGES.FI;
  const locale = useLocale();
  const textLocale = capitalize(locale);
  const dateInputLimits = {
    min: addYears(new Date(), -1),
    max: addYears(new Date(), 2),
  };

  return {
    t,
    translationsBase,
    languageOptions,
    language,
    cbPrefix,
    textLocale,
    clearDeminimisAids,
    clearBenefitValues,
    clearCommissionValues,
    clearContractValues,
    clearDatesValues,
    clearAlternativeAddressValues,
    getErrorMessage,
    displayPastApplicationDatesWarning,
    dateInputLimits,
  };
};

export { useFormContent };
