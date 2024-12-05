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
  $ApplicationDetailLabel,
  $ApplicationDetailRow,
  $ApplicationDetailValue,
  $ApplicationDetailWrapper,
} from '../../ApplicationInfo.sc';

const paySubsidyTranslation = (value: PAY_SUBSIDY_GRANTED): string => {
  switch (value) {
    case PAY_SUBSIDY_GRANTED.GRANTED:
      return 'paySubsidyDefault';

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
        <$GridCell $colSpan={12}>
          <$ApplicationDetailWrapper $fontSize={theme.fontSize.body.m}>
            <$ApplicationDetailRow data-testid="application-field-firstName">
              <$ApplicationDetailLabel>
                {t(`${translationsBase}.employee.fields.firstName.label`)}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {data.employee?.firstName || ''}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
            <$ApplicationDetailRow data-testid="application-field-lastName">
              <$ApplicationDetailLabel>
                {t(`${translationsBase}.employee.fields.lastName.label`)}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {data.employee?.lastName || ''}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
            <$ApplicationDetailRow data-testid="application-field-socialSecurityNumber">
              <$ApplicationDetailLabel>
                {t(
                  `${translationsBase}.employee.fields.socialSecurityNumber.label`
                )}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {data.employee?.socialSecurityNumber}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
            <$ApplicationDetailRow
              $alignItems="flex-start"
              $forceColumn
              data-testid="application-field-isLivingInHelsinki"
            >
              <$ApplicationDetailLabel>
                {t(
                  `${translationsBase}.employee.fields.isLivingInHelsinki.label`
                )}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {t(
                  `${translationsBase}.employee.fields.isLivingInHelsinki.${
                    data.employee?.isLivingInHelsinki ? 'yes' : 'no'
                  }`
                )}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
            {data.associationImmediateManagerCheck && (
              <$ApplicationDetailRow
                $alignItems="flex-start"
                $forceColumn
                data-testid="application-field-associationImmediateManagerCheck"
              >
                <$ApplicationDetailLabel>
                  {t(
                    `${translationsBase}.employee.fields.associationImmediateManagerCheck.label`
                  )}
                </$ApplicationDetailLabel>
                <$ApplicationDetailValue>
                  {t('common:utility.yes')}
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>
            )}
          </$ApplicationDetailWrapper>
        </$GridCell>
      </SummarySection>

      {(data.benefitType === BENEFIT_TYPES.SALARY ||
        data.benefitType === BENEFIT_TYPES.EMPLOYMENT) && (
        <SummarySection
          withoutDivider
          header={t(`${translationsBase}.employee.heading5Employment`)}
        >
          <$GridCell $colSpan={5}>
            <$ApplicationDetailWrapper $fontSize={theme.fontSize.body.m}>
              <$ApplicationDetailRow data-testid="application-field-jobTitle">
                <$ApplicationDetailLabel>
                  {t(`${translationsBase}.employee.fields.jobTitle.label`)}
                </$ApplicationDetailLabel>
                <$ApplicationDetailValue>
                  {data.employee?.jobTitle || '-'}
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>

              <$ApplicationDetailRow data-testid="application-field-collectiveBargainingAgreement">
                <$ApplicationDetailLabel>
                  {t(
                    `${translationsBase}.employee.fields.collectiveBargainingAgreement.placeholder`
                  )}
                </$ApplicationDetailLabel>
                <$ApplicationDetailValue>
                  {data.employee?.collectiveBargainingAgreement}
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>
              <$ApplicationDetailRow data-testid="application-field-workingHours">
                <$ApplicationDetailLabel>
                  {t(`${translationsBase}.employee.fields.workingHours.label`)}
                </$ApplicationDetailLabel>
                <$ApplicationDetailValue>
                  {formatStringFloatValue(data.employee?.workingHours)}{' '}
                  {t(
                    `${translationsBase}.employee.fields.workingHours.helperText`
                  )}
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>

              <$ApplicationDetailRow data-testid="application-field-monthlyPay">
                <$ApplicationDetailLabel>
                  {t(`${translationsBase}.employee.fields.monthlyPay.label`)}
                </$ApplicationDetailLabel>
                <$ApplicationDetailValue>
                  {formatFloatToCurrency(data.employee?.monthlyPay)}
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>

              <$ApplicationDetailRow data-testid="application-field-vacationMoney">
                <$ApplicationDetailLabel>
                  {t(`${translationsBase}.employee.fields.vacationMoney.label`)}
                </$ApplicationDetailLabel>
                <$ApplicationDetailValue>
                  {formatFloatToCurrency(data.employee?.vacationMoney)}
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>
              <$ApplicationDetailRow data-testid="application-field-otherExpenses">
                <$ApplicationDetailLabel>
                  {t(`${translationsBase}.employee.fields.otherExpenses.label`)}
                </$ApplicationDetailLabel>

                <$ApplicationDetailValue>
                  {formatFloatToCurrency(data.employee?.otherExpenses)}
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>
              {data.paySubsidyGranted && (
                <$ApplicationDetailWrapper $fontSize={theme.fontSize.body.m}>
                  <$ApplicationDetailRow data-testid="application-field-paySubsidyGranted">
                    <$ApplicationDetailLabel>
                      {t(
                        `${translationsBase}.employee.fields.paySubsidyGranted.labelShort`
                      )}
                    </$ApplicationDetailLabel>
                    <$ApplicationDetailValue>
                      {t(
                        `${translationsBase}.employee.fields.paySubsidyGranted.${paySubsidyTranslation(
                          data.paySubsidyGranted
                        )}`
                      )}
                    </$ApplicationDetailValue>
                  </$ApplicationDetailRow>
                  <$ApplicationDetailRow data-testid="application-field-apprenticeshipProgram">
                    <$ApplicationDetailLabel>
                      {t(
                        `${translationsBase}.employee.fields.apprenticeshipProgram.label`
                      )}
                    </$ApplicationDetailLabel>
                    <$ApplicationDetailValue>
                      {t(
                        `${translationsBase}.employee.fields.apprenticeshipProgram.${
                          data.apprenticeshipProgram ? 'yes' : 'no'
                        }`
                      )}
                    </$ApplicationDetailValue>
                  </$ApplicationDetailRow>
                </$ApplicationDetailWrapper>
              )}
            </$ApplicationDetailWrapper>
          </$GridCell>
        </SummarySection>
      )}
      <SummarySection header={t(`${translationsBase}.employee.heading4`)}>
        <$ApplicationDetailWrapper>
          <$ApplicationDetailRow data-testid="application-field-startDate">
            <$ApplicationDetailLabel>
              {t(`${translationsBase}.employee.fields.startDate.label`)}
            </$ApplicationDetailLabel>
            <$ApplicationDetailValue>
              {convertToUIDateFormat(data.startDate) || '-'}
            </$ApplicationDetailValue>
          </$ApplicationDetailRow>
          <$ApplicationDetailRow data-testid="application-field-endDate">
            <$ApplicationDetailLabel>
              {t(`${translationsBase}.employee.fields.endDate.label`)}
            </$ApplicationDetailLabel>
            <$ApplicationDetailValue>
              {convertToUIDateFormat(data.endDate) || '-'}
            </$ApplicationDetailValue>
          </$ApplicationDetailRow>
        </$ApplicationDetailWrapper>
      </SummarySection>
    </>
  );
};

export default EmployeeView;
