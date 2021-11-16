import SummarySection from 'benefit/applicant/components/summarySection/SummarySection';
import { Application, DeMinimisAid } from 'benefit/applicant/types/application';
import { Button, IconPen } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import {
  $SummaryTableHeader,
  $SummaryTableValue,
  $ViewField,
  $ViewFieldBold,
} from '../../Application.sc';

export interface CompanyInfoViewProps {
  data: Application;
  handleStepChange: (step: number) => void;
}

const CompanyInfoView: React.FC<CompanyInfoViewProps> = ({
  data,
  handleStepChange,
}) => {
  // console.log(data);
  const translationsBase = 'common:applications.sections';
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <>
      <SummarySection
        header={t(`${translationsBase}.company.heading1`)}
        action={
          <Button
            theme="black"
            css={`
              margin-top: ${theme.spacing.s};
            `}
            onClick={() => handleStepChange(1)}
            variant="supplementary"
            iconLeft={<IconPen />}
          >
            {t(`common:applications.actions.edit`)}
          </Button>
        }
        withoutDivider
      >
        <$GridCell $colSpan={3}>
          <$ViewField>{data.company?.name}</$ViewField>
          <$ViewField>{`${t(`${translationsBase}.company.businessId`, {
            businessId: data.company?.businessId,
          })}`}</$ViewField>
          <$ViewField>
            {t(
              `${translationsBase}.company.fields.companyBankAccountNumber.label`
            )}
            : {data?.companyBankAccountNumber}
          </$ViewField>
        </$GridCell>

        <$GridCell $colSpan={3}>
          <$ViewField>
            {data.alternativeCompanyStreetAddress ||
              data.company?.streetAddress}
          </$ViewField>
          <$ViewField>{`${
            data.alternativeCompanyPostcode || data.company?.postcode || ''
          } ${
            data.alternativeCompanyCity || data.company?.city || ''
          }`}</$ViewField>
        </$GridCell>
      </SummarySection>
      Alternative address and department data?
      <SummarySection
        header={t(`${translationsBase}.company.heading2Short`)}
        withoutDivider
      >
        <$GridCell $colSpan={3}>
          <$ViewField>
            {[
              data.companyContactPersonFirstName || '',
              data.companyContactPersonLastName || '',
            ]
              .join(' ')
              .trim()}
          </$ViewField>
          <$ViewField>{data.companyContactPersonPhoneNumber}</$ViewField>
          <$ViewField>{data.companyContactPersonEmail}</$ViewField>
          <$ViewField>
            {t(`${translationsBase}.company.fields.applicantLanguage.label`)}
            {': '}
            <$ViewFieldBold>
              {t(`common:languages.${data.applicantLanguage || ''}`)}
            </$ViewFieldBold>
          </$ViewField>
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
                key={`${aid.granter ?? ''}${aid.grantedAt ?? ''}`}
              >
                <$GridCell $colStart={1} $colSpan={3}>
                  <$SummaryTableValue>{aid.granter}</$SummaryTableValue>
                </$GridCell>
                <$GridCell $colSpan={2}>
                  <$SummaryTableValue>{aid.amount}</$SummaryTableValue>
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
          '-'
        )}
      </SummarySection>
      <SummarySection header={t(`${translationsBase}.company.heading5`)}>
        <$GridCell $colStart={1} $colSpan={6}>
          {t(
            `${translationsBase}.company.fields.coOperationNegotiations.label`
          )}{' '}
          <$ViewFieldBold>
            {t(
              `${translationsBase}.company.fields.coOperationNegotiations.${
                data.coOperationNegotiations ? 'yes' : 'no'
              }`
            )}
          </$ViewFieldBold>
        </$GridCell>
      </SummarySection>
    </>
  );
};

export default CompanyInfoView;
