import SummarySection from 'benefit/applicant/components/summarySection/SummarySection';
import { BENEFIT_TYPES, PAY_SUBSIDY_GRANTED } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Button, IconPen } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import {
  formatFloatToCurrency,
  formatStringFloatValue,
} from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import {
  $CompanyInfoLabel,
  $CompanyInfoRow,
  $CompanyInfoValue,
  $CompanyInfoWrapper,
} from '../../step1/companyInfo/CompanyInfo.sc';

const paySubsidyTranslation = (value: PAY_SUBSIDY_GRANTED): string => {
  switch (value) {
    case PAY_SUBSIDY_GRANTED.GRANTED:
      return 'granted';

    case PAY_SUBSIDY_GRANTED.GRANTED_AGED:
      return 'paySubsidyAged';

    case PAY_SUBSIDY_GRANTED.NOT_GRANTED:
      return 'paySubsidyNone';

    default:
      return 'paySubsidyNone';
  }
};

export interface EmployeeViewProps {
  data: Application;
  isReadOnly?: boolean;
  handleStepChange: (step: number) => void;
}

const EmployeeView: React.FC<EmployeeViewProps> = ({
  data,
  isReadOnly,
  handleStepChange,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const theme = useTheme();
  const translationsBase = 'common:applications.sections';
  const { t } = useTranslation();
  return (
    <>
      <SummarySection
        header={t(`${translationsBase}.employee.heading1Short`)}
        action={
          !isReadOnly && (
            <Button
              theme="black"
              onClick={() => handleStepChange(2)}
              variant="supplementary"
              iconLeft={<IconPen />}
            >
              {t(`common:applications.actions.edit`)}
            </Button>
          )
        }
        withoutDivider
      >
        <$GridCell $colSpan={3}>
          <$CompanyInfoWrapper $fontSize={theme.fontSize.body.m}>
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.employee.fields.firstName.label`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {data.employee?.firstName || ''}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.employee.fields.lastName.label`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {data.employee?.lastName || ''}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(
                  `${translationsBase}.employee.fields.socialSecurityNumber.label`
                )}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {data.employee?.socialSecurityNumber}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
            <$CompanyInfoRow $alignItems="flex-start">
              <$CompanyInfoLabel>
                {t(
                  `${translationsBase}.employee.fields.isLivingInHelsinki.label`
                )}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {t(
                  `${translationsBase}.employee.fields.isLivingInHelsinki.${
                    data.employee?.isLivingInHelsinki ? 'yes' : 'no'
                  }`
                )}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
          </$CompanyInfoWrapper>
        </$GridCell>
      </SummarySection>

      {(data.benefitType === BENEFIT_TYPES.SALARY ||
        data.benefitType === BENEFIT_TYPES.EMPLOYMENT) && (
        <SummarySection
          withoutDivider
          header={t(`${translationsBase}.employee.heading5Employment`)}
        >
          <$GridCell $colSpan={5}>
            <$CompanyInfoWrapper $fontSize={theme.fontSize.body.m}>
              <$CompanyInfoRow>
                <$CompanyInfoLabel>
                  {t(`${translationsBase}.employee.fields.jobTitle.label`)}
                </$CompanyInfoLabel>
                <$CompanyInfoValue>
                  {data.employee?.jobTitle || '-'}
                </$CompanyInfoValue>
              </$CompanyInfoRow>

              <$CompanyInfoRow>
                <$CompanyInfoLabel>
                  {t(
                    `${translationsBase}.employee.fields.collectiveBargainingAgreement.placeholder`
                  )}
                </$CompanyInfoLabel>
                <$CompanyInfoValue>
                  {data.employee?.collectiveBargainingAgreement}
                </$CompanyInfoValue>
              </$CompanyInfoRow>
              <$CompanyInfoRow>
                <$CompanyInfoLabel>
                  {t(`${translationsBase}.employee.fields.workingHours.label`)}
                </$CompanyInfoLabel>
                <$CompanyInfoValue>
                  {formatStringFloatValue(data.employee?.workingHours)}{' '}
                  {t(
                    `${translationsBase}.employee.fields.workingHours.helperText`
                  )}
                </$CompanyInfoValue>
              </$CompanyInfoRow>

              <$CompanyInfoRow>
                <$CompanyInfoLabel>
                  {t(`${translationsBase}.employee.fields.monthlyPay.label`)}
                </$CompanyInfoLabel>
                <$CompanyInfoValue>
                  {formatFloatToCurrency(data.employee?.monthlyPay, 'EUR')}
                </$CompanyInfoValue>
              </$CompanyInfoRow>

              <$CompanyInfoRow>
                <$CompanyInfoLabel>
                  {t(`${translationsBase}.employee.fields.vacationMoney.label`)}
                </$CompanyInfoLabel>
                <$CompanyInfoValue>
                  {formatFloatToCurrency(data.employee?.vacationMoney, 'EUR')}
                </$CompanyInfoValue>
              </$CompanyInfoRow>
              <$CompanyInfoRow>
                <$CompanyInfoLabel>
                  {t(`${translationsBase}.employee.fields.otherExpenses.label`)}
                </$CompanyInfoLabel>

                <$CompanyInfoValue>
                  {formatFloatToCurrency(data.employee?.otherExpenses, 'EUR')}
                </$CompanyInfoValue>
              </$CompanyInfoRow>
              {data.paySubsidyGranted ? (
                <$CompanyInfoWrapper $fontSize={theme.fontSize.body.m}>
                  <$CompanyInfoRow>
                    <$CompanyInfoLabel>
                      {t(
                        `${translationsBase}.employee.fields.paySubsidyGranted.labelShort`
                      )}
                    </$CompanyInfoLabel>
                    <$CompanyInfoValue>
                      {t(
                        `${translationsBase}.employee.fields.paySubsidyGranted.${paySubsidyTranslation(
                          data.paySubsidyGranted
                        )}`
                      )}
                    </$CompanyInfoValue>
                  </$CompanyInfoRow>
                  <$CompanyInfoRow>
                    <$CompanyInfoLabel>
                      {t(
                        `${translationsBase}.employee.fields.apprenticeshipProgram.label`
                      )}
                    </$CompanyInfoLabel>
                    <$CompanyInfoValue>
                      {t(
                        `${translationsBase}.employee.fields.apprenticeshipProgram.${
                          data.apprenticeshipProgram ? 'yes' : 'no'
                        }`
                      )}
                    </$CompanyInfoValue>
                  </$CompanyInfoRow>
                </$CompanyInfoWrapper>
              ) : (
                <$CompanyInfoWrapper $fontSize={theme.fontSize.body.m}>
                  <$CompanyInfoRow>
                    <$CompanyInfoLabel>
                      {t(
                        `${translationsBase}.employee.fields.paySubsidyGranted.label`
                      )}{' '}
                    </$CompanyInfoLabel>
                    <$CompanyInfoValue>
                      {t(
                        `${translationsBase}.employee.fields.paySubsidyGranted.no`
                      )}
                    </$CompanyInfoValue>
                  </$CompanyInfoRow>
                </$CompanyInfoWrapper>
              )}
            </$CompanyInfoWrapper>
          </$GridCell>
        </SummarySection>
      )}
      <SummarySection header={t(`${translationsBase}.employee.heading4`)}>
        <$CompanyInfoWrapper>
          <$CompanyInfoRow>
            <$CompanyInfoLabel>
              {t(`${translationsBase}.employee.fields.startDate.label`)}
            </$CompanyInfoLabel>
            <$CompanyInfoValue>
              {convertToUIDateFormat(data.startDate) || '-'}
            </$CompanyInfoValue>
          </$CompanyInfoRow>
          <$CompanyInfoRow>
            <$CompanyInfoLabel>
              {t(`${translationsBase}.employee.fields.endDate.label`)}
            </$CompanyInfoLabel>
            <$CompanyInfoValue>
              {convertToUIDateFormat(data.endDate) || '-'}
            </$CompanyInfoValue>
          </$CompanyInfoRow>
        </$CompanyInfoWrapper>
      </SummarySection>
    </>
  );
};

export default EmployeeView;
