import SummarySection from 'benefit/applicant/components/summarySection/SummarySection';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { Application, DeMinimisAid } from 'benefit-shared/types/application';
import { formatIBAN } from 'benefit-shared/utils/common';
import { Button, IconPen } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import {
  $SummaryTableHeader,
  $SummaryTableValue,
  $ViewField,
} from '../../Application.sc';
import {
  $ApplicationDetailLabel,
  $ApplicationDetailRow,
  $ApplicationDetailValue,
  $ApplicationDetailWrapper,
} from '../../ApplicationInfo.sc';

export interface CompanyInfoViewProps {
  data: Application;
  isReadOnly?: boolean;
  handleStepChange: (step: number) => void;
}

const CompanyInfoView: React.FC<CompanyInfoViewProps> = ({
  data,
  isReadOnly,
  handleStepChange,
}) => {
  const translationsBase = 'common:applications.sections';
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <>
      <SummarySection
        action={
          !isReadOnly && (
            <Button
              theme="black"
              onClick={() => handleStepChange(1)}
              variant="supplementary"
              iconLeft={<IconPen />}
            >
              {t(`common:applications.actions.edit`)}
            </Button>
          )
        }
        header={t(`${translationsBase}.company.heading1`)}
        withoutDivider
      >
        <$GridCell $colSpan={5}>
          <$ApplicationDetailWrapper $fontSize={theme.fontSize.body.m}>
            <$ApplicationDetailRow data-testid="application-field-companyName">
              <$ApplicationDetailLabel>
                {t(`${translationsBase}.company.fields.companyName`)}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {data.company?.name}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>

            <$ApplicationDetailRow data-testid="application-field-companyBusinessId">
              <$ApplicationDetailLabel>
                {t(`${translationsBase}.company.fields.companyBusinessId`)}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {data.company?.businessId}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>

            <$ApplicationDetailRow data-testid="application-field-companyAddress">
              <$ApplicationDetailLabel>
                {t(`${translationsBase}.company.fields.companyAddress`)}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue $column>
                <div>{data.company?.streetAddress}</div>
                <div>
                  {data.company?.postcode || ''} {data.company?.city || ''}
                </div>
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
            {data.alternativeCompanyStreetAddress && (
              <$ApplicationDetailRow data-testid="application-field-alternativeCompanyStreetAddress">
                <$ApplicationDetailLabel>
                  {t(
                    `${translationsBase}.company.fields.alternativeCompanyStreetAddress.view`
                  )}
                </$ApplicationDetailLabel>
                <$ApplicationDetailValue $column>
                  <div>
                    {data.companyDepartment ? data.companyDepartment : ''}
                  </div>
                  <div>{data.alternativeCompanyStreetAddress}</div>
                  <div>
                    {data.alternativeCompanyPostcode}{' '}
                    {data.alternativeCompanyCity}
                  </div>
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>
            )}
            <$ApplicationDetailRow data-testid="application-field-companyBankAccountNumber">
              <$ApplicationDetailLabel>
                {t(
                  `${translationsBase}.company.fields.companyBankAccountNumber.label`
                )}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {formatIBAN(data?.companyBankAccountNumber)}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>

            {data?.organizationType === ORGANIZATION_TYPES.ASSOCIATION && (
              <$ApplicationDetailRow
                $forceColumn
                data-testid="application-field-associationHasBusinessActivities"
              >
                <$ApplicationDetailLabel>
                  {t(
                    `${translationsBase}.company.fields.associationHasBusinessActivities.label`
                  )}
                </$ApplicationDetailLabel>
                <$ApplicationDetailValue>
                  {data?.associationHasBusinessActivities
                    ? t('common:utility.yes')
                    : t('common:utility.no ')}
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>
            )}
          </$ApplicationDetailWrapper>
        </$GridCell>
      </SummarySection>

      <SummarySection
        header={t(`${translationsBase}.company.heading2`)}
        withoutDivider
      >
        <$GridCell $colSpan={3}>
          <$ApplicationDetailWrapper $fontSize={theme.fontSize.body.m}>
            <$ApplicationDetailRow data-testid="application-field-companyContactPersonFirstName">
              <$ApplicationDetailLabel>
                {t(
                  `${translationsBase}.company.fields.companyContactPersonFirstName.label`
                )}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {data.companyContactPersonFirstName}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
            <$ApplicationDetailRow data-testid="application-field-companyContactPersonLastName">
              <$ApplicationDetailLabel>
                {t(
                  `${translationsBase}.company.fields.companyContactPersonLastName.label`
                )}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {data.companyContactPersonLastName}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
            <$ApplicationDetailRow data-testid="application-field-companyContactPersonPhoneNumber">
              <$ApplicationDetailLabel>
                {t(
                  `${translationsBase}.company.fields.companyContactPersonPhoneNumber.label`
                )}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {data.companyContactPersonPhoneNumber}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
            <$ApplicationDetailRow data-testid="application-field-companyContactPersonEmail">
              <$ApplicationDetailLabel>
                {t(
                  `${translationsBase}.company.fields.companyContactPersonEmail.placeholder`
                )}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {data.companyContactPersonEmail}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
            <$ApplicationDetailRow data-testid="application-field-applicantLanguage">
              <$ApplicationDetailLabel>
                {t(
                  `${translationsBase}.company.fields.applicantLanguage.label`
                )}
              </$ApplicationDetailLabel>
              <$ApplicationDetailValue>
                {t(`common:languages.${data.applicantLanguage || ''}`)}
              </$ApplicationDetailValue>
            </$ApplicationDetailRow>
          </$ApplicationDetailWrapper>
        </$GridCell>
      </SummarySection>
      <SummarySection
        gap={theme.spacing.xs3}
        header={t(`${translationsBase}.company.heading3`)}
        withoutDivider
      >
        {data.deMinimisAidSet && data.deMinimisAidSet?.length > 0 ? (
          <>
            <$GridCell $colSpan={3}>
              <$SummaryTableHeader>
                {t(
                  `${translationsBase}.company.fields.deMinimisAidGranter.label`
                )}
              </$SummaryTableHeader>
            </$GridCell>
            <$GridCell $colSpan={2}>
              <$SummaryTableHeader>
                {t(
                  `${translationsBase}.company.fields.deMinimisAidAmount.label`
                )}
              </$SummaryTableHeader>
            </$GridCell>
            <$GridCell>
              <$SummaryTableHeader>
                {t(
                  `${translationsBase}.company.fields.deMinimisAidGrantedAt.labelShort`
                )}
              </$SummaryTableHeader>
            </$GridCell>
            {data.deMinimisAidSet?.map((aid: DeMinimisAid) => (
              <React.Fragment
                key={`${aid.granter ?? ''}${convertToUIDateFormat(
                  aid.grantedAt
                )}`}
              >
                <$GridCell $colStart={1} $colSpan={3}>
                  <$SummaryTableValue>{aid.granter}</$SummaryTableValue>
                </$GridCell>
                <$GridCell $colSpan={2}>
                  <$SummaryTableValue data-testid="application-field-deMinimisAidsAmount">
                    {formatFloatToCurrency(aid.amount)}
                  </$SummaryTableValue>
                </$GridCell>
                <$GridCell>
                  <$SummaryTableValue>
                    {aid.grantedAt ? convertToUIDateFormat(aid.grantedAt) : ''}
                  </$SummaryTableValue>
                </$GridCell>
              </React.Fragment>
            ))}
          </>
        ) : (
          <$GridCell
            $colSpan={12}
            data-testid="application-field-deMinimisAidsNo"
          >
            <$ViewField>
              {t(`${translationsBase}.company.deMinimisAidsNo`)}
            </$ViewField>
          </$GridCell>
        )}
      </SummarySection>
      <SummarySection header={t(`${translationsBase}.company.heading4`)}>
        <$GridCell
          $colStart={1}
          $colSpan={12}
          data-testid="application-field-coOperationNegotiations"
        >
          {t(
            `${translationsBase}.company.fields.coOperationNegotiations.view.${
              data.coOperationNegotiations ? 'yes' : 'no'
            }`
          )}
        </$GridCell>
        {data.coOperationNegotiations && (
          <$GridCell $colSpan={12}>
            <$ApplicationDetailWrapper>
              <$ApplicationDetailRow
                $forceColumn
                data-testid="application-field-coOperationNegotiationsDescription"
              >
                <$ApplicationDetailLabel>
                  {t(
                    `${translationsBase}.company.fields.coOperationNegotiationsDescription.labelShort`
                  )}
                </$ApplicationDetailLabel>
                <$ApplicationDetailValue>
                  {data.coOperationNegotiationsDescription}
                </$ApplicationDetailValue>
              </$ApplicationDetailRow>
            </$ApplicationDetailWrapper>
          </$GridCell>
        )}
      </SummarySection>
    </>
  );
};

export default CompanyInfoView;
