import SummarySection from 'benefit/applicant/components/summarySection/SummarySection';
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
  $CompanyInfoLabel,
  $CompanyInfoRow,
  $CompanyInfoValue,
  $CompanyInfoWrapper,
} from '../../step1/companyInfo/CompanyInfo.sc';

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
          <$CompanyInfoWrapper $fontSize={theme.fontSize.body.m}>
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.company.fields.companyName`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>{data.company?.name}</$CompanyInfoValue>
            </$CompanyInfoRow>

            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.company.fields.companyBusinessId`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>{data.company?.businessId}</$CompanyInfoValue>
            </$CompanyInfoRow>

            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.company.fields.companyAddress`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue $column>
                <div>{data.company?.streetAddress}</div>
                <div>
                  {data.company?.postcode || ''} {data.company?.city || ''}
                </div>
              </$CompanyInfoValue>
            </$CompanyInfoRow>
            {data.alternativeCompanyStreetAddress && (
              <$CompanyInfoRow>
                <$CompanyInfoLabel>
                  {t(
                    `${translationsBase}.company.fields.alternativeCompanyStreetAddress.view`
                  )}
                </$CompanyInfoLabel>
                <$CompanyInfoValue $column>
                  <div>
                    {data.companyDepartment ? data.companyDepartment : ''}
                  </div>
                  <div>{data.alternativeCompanyStreetAddress}</div>
                  <div>
                    {data.alternativeCompanyPostcode}{' '}
                    {data.alternativeCompanyCity}
                  </div>
                </$CompanyInfoValue>
              </$CompanyInfoRow>
            )}
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(
                  `${translationsBase}.company.fields.companyBankAccountNumber.label`
                )}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {formatIBAN(data?.companyBankAccountNumber)}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
          </$CompanyInfoWrapper>
        </$GridCell>
      </SummarySection>

      <SummarySection
        header={t(`${translationsBase}.company.heading2`)}
        withoutDivider
      >
        <$GridCell $colSpan={3}>
          <$CompanyInfoWrapper $fontSize={theme.fontSize.body.m}>
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(
                  `${translationsBase}.company.fields.companyContactPersonFirstName.label`
                )}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {data.companyContactPersonFirstName}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(
                  `${translationsBase}.company.fields.companyContactPersonLastName.label`
                )}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {data.companyContactPersonLastName}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(
                  `${translationsBase}.company.fields.companyContactPersonPhoneNumber.label`
                )}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {data.companyContactPersonPhoneNumber}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(
                  `${translationsBase}.company.fields.companyContactPersonEmail.placeholder`
                )}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {data.companyContactPersonEmail}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
            <$CompanyInfoRow>
              <$CompanyInfoLabel>
                {t(
                  `${translationsBase}.company.fields.applicantLanguage.label`
                )}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                {t(`common:languages.${data.applicantLanguage || ''}`)}
              </$CompanyInfoValue>
            </$CompanyInfoRow>
          </$CompanyInfoWrapper>
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
                  <$SummaryTableValue>
                    {formatFloatToCurrency(aid.amount, 'EUR')}
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
          <$GridCell $colSpan={12}>
            <$ViewField>
              {t(`${translationsBase}.company.deMinimisAidsNo`)}
            </$ViewField>
          </$GridCell>
        )}
      </SummarySection>
      <SummarySection header={t(`${translationsBase}.company.heading4`)}>
        <$GridCell $colStart={1} $colSpan={12}>
          {t(
            `${translationsBase}.company.fields.coOperationNegotiations.view.${
              data.coOperationNegotiations ? 'yes' : 'no'
            }`
          )}
        </$GridCell>
        <$GridCell $colSpan={12}>
          <$CompanyInfoRow>
            <$CompanyInfoLabel>
              {t(
                `${translationsBase}.company.fields.coOperationNegotiationsDescription.labelShort`
              )}
            </$CompanyInfoLabel>
            <$CompanyInfoValue>
              {data.coOperationNegotiationsDescription}
            </$CompanyInfoValue>
          </$CompanyInfoRow>
        </$GridCell>
      </SummarySection>
    </>
  );
};

export default CompanyInfoView;
