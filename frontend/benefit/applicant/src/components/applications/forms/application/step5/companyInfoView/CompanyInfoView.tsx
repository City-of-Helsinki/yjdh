import SummarySection from 'benefit/applicant/components/summarySection/SummarySection';
import { Application, DeMinimisAid } from 'benefit/applicant/types/application';
import { Button, IconPen } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatStringFloatValue } from 'shared/utils/string.utils';
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
          <$ViewField>{data.company?.streetAddress}</$ViewField>
          <$ViewField>{`${data.company?.postcode || ''} ${
            data.company?.city || ''
          }`}</$ViewField>
        </$GridCell>
      </SummarySection>
      {data.alternativeCompanyStreetAddress && (
        <SummarySection>
          <$GridCell
            $colSpan={12}
            css={`
              font-size: ${theme.fontSize.body.m};
              margin: ${theme.spacing.xs4} 0;
            `}
          >
            <$ViewFieldBold>
              {t(`${translationsBase}.company.heading1Additional`)}
            </$ViewFieldBold>
          </$GridCell>
          <$GridCell $colSpan={3}>
            {data.companyDepartment && (
              <$ViewField>{data.companyDepartment}</$ViewField>
            )}
            <$ViewField>{data.alternativeCompanyStreetAddress}</$ViewField>
            <$ViewField>
              {[data.alternativeCompanyPostcode, data.alternativeCompanyCity]
                .join(' ')
                .trim()}
            </$ViewField>
          </$GridCell>
        </SummarySection>
      )}
      <SummarySection
        header={t(`${translationsBase}.company.heading2Short`)}
        withoutDivider
      >
        <$GridCell $colSpan={3}>
          <$ViewField>
            {getFullName(
              data.companyContactPersonFirstName,
              data.companyContactPersonLastName
            )}
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
                key={`${aid.granter ?? ''}${convertToUIDateFormat(
                  aid.grantedAt
                )}`}
              >
                <$GridCell $colStart={1} $colSpan={3}>
                  <$SummaryTableValue>{aid.granter}</$SummaryTableValue>
                </$GridCell>
                <$GridCell $colSpan={2}>
                  <$SummaryTableValue>
                    {formatStringFloatValue(aid.amount)}
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
              {t(`${translationsBase}.company.deMinimisAidsNo`)}{' '}
              <$ViewFieldBold>{t('common:utility.no')}</$ViewFieldBold>
            </$ViewField>
          </$GridCell>
        )}
      </SummarySection>
      <SummarySection header={t(`${translationsBase}.company.heading5`)}>
        <$GridCell $colStart={1} $colSpan={12}>
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
          <$ViewField>{data.coOperationNegotiationsDescription}</$ViewField>
        </$GridCell>
      </SummarySection>
    </>
  );
};

export default CompanyInfoView;
