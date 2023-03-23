import { ReviewChildProps } from 'benefit/handler/types/common';
import { DeMinimisAid } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
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
} from '../../ApplicationForm.sc';
import SummarySection from '../summarySection/SummarySection';

const CompanySection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <SummarySection
        header={t(`${translationsBase}.headings.company1`)}
        withoutDivider
      >
        <$GridCell $colSpan={3}>
          <$ViewField>{data.company?.name}</$ViewField>
          <$ViewField>
            {t(`${translationsBase}.companyBusinessId`)}:{' '}
            {data?.company?.businessId}
          </$ViewField>
          <$ViewField>
            {t(`${translationsBase}.fields.companyBankAccountNumber.label`)}:{' '}
            {data?.companyBankAccountNumber}
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
              {t(`${translationsBase}.headings.company5`)}
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
        header={t(`${translationsBase}.headings.company2`)}
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
            {t(`${translationsBase}.fields.applicantLanguage.label`)}
            {': '}
            <$ViewFieldBold>
              {t(`common:languages.${data.applicantLanguage || ''}`)}
            </$ViewFieldBold>
          </$ViewField>
        </$GridCell>
      </SummarySection>
      <SummarySection
        gap={theme.spacing.xs3}
        header={t(`${translationsBase}.headings.company3`)}
        withoutDivider
      >
        {data.deMinimisAidSet && data.deMinimisAidSet?.length > 0 ? (
          <>
            <$GridCell $colSpan={3}>
              <$SummaryTableHeader>
                {t(`${translationsBase}.fields.deMinimisAidGranter.label`)}
              </$SummaryTableHeader>
            </$GridCell>
            <$GridCell $colSpan={2}>
              <$SummaryTableHeader>
                {t(`${translationsBase}.fields.deMinimisAidAmount.label`)}
              </$SummaryTableHeader>
            </$GridCell>
            <$GridCell>
              <$SummaryTableHeader>
                {t(
                  `${translationsBase}.fields.deMinimisAidGrantedAt.labelShort`
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
              {t(`${translationsBase}.fields.deMinimisAid.no`)}
            </$ViewField>
          </$GridCell>
        )}
      </SummarySection>
      <SummarySection header={t(`${translationsBase}.headings.company4`)}>
        <$GridCell $colStart={1} $colSpan={12}>
          {t(`${translationsBase}.fields.coOperationNegotiations.label`)}{' '}
          <$ViewFieldBold>
            {t(
              `${translationsBase}.fields.coOperationNegotiations.${
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

export default CompanySection;
