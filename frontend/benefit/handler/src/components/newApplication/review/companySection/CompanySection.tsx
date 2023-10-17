import { ReviewChildProps } from 'benefit/handler/types/common';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { friendlyFormatIBAN } from 'ibantools';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import {
  $SummaryTableHeader,
  $SummaryTableLastLine,
  $SummaryTableValue,
  $ViewField,
  $ViewFieldBold,
} from '../../ApplicationForm.sc';
import EditButton from '../summarySection/EditButton';
import SummarySection from '../summarySection/SummarySection';

const CompanySection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
  dispatchStep,
  fields,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <SummarySection
        header={t(`${translationsBase}.headings.company1`)}
        action={
          <EditButton section="companySection" dispatchStep={dispatchStep} />
        }
      >
        <$GridCell $colSpan={6}>
          <$ViewFieldBold large>{data.company?.name}</$ViewFieldBold>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.companyBusinessId.label`)}
          </$ViewFieldBold>
          <$ViewField>{data.company?.businessId}</$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.address.label`)}
          </$ViewFieldBold>
          <$ViewField>{`${data.company?.streetAddress}, ${
            data.company?.postcode || ''
          } ${data.company?.city || ''}`}</$ViewField>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.companyBankAccountNumber.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {friendlyFormatIBAN(data?.companyBankAccountNumber)}
          </$ViewField>
        </$GridCell>

        {data.alternativeCompanyStreetAddress && (
          <$GridCell $colSpan={6}>
            <$ViewFieldBold>
              {t(`${translationsBase}.fields.alternativeAddress.label`)}
            </$ViewFieldBold>
            <$ViewField>
              {data.companyDepartment && <div>{data.companyDepartment}</div>}
              {[
                data.alternativeCompanyStreetAddress,
                data.alternativeCompanyPostcode,
                data.alternativeCompanyCity,
              ]
                .join(', ')
                .trim()}
            </$ViewField>
          </$GridCell>
        )}
        {data?.company?.organizationType === ORGANIZATION_TYPES.ASSOCIATION && (
          <$GridCell $colSpan={6} $colStart={1}>
            <$ViewFieldBold>
              {t(
                `${translationsBase}.fields.associationHasBusinessActivities.label`
              )}
            </$ViewFieldBold>
            <$ViewField>
              {data?.associationHasBusinessActivities
                ? t(
                    `${translationsBase}.fields.associationHasBusinessActivities.yes`
                  )
                : t(
                    `${translationsBase}.fields.associationHasBusinessActivities.no`
                  )}
            </$ViewField>
          </$GridCell>
        )}
      </SummarySection>
      <SummarySection
        header={t(`${translationsBase}.headings.company2`)}
        action={
          <EditButton
            section={fields.companyContactPersonFirstName.name}
            dispatchStep={dispatchStep}
          />
        }
      >
        <$GridCell $colSpan={6}>
          <$ViewFieldBold large>
            {getFullName(
              data.companyContactPersonFirstName,
              data.companyContactPersonLastName
            )}
          </$ViewFieldBold>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(
              `${translationsBase}.fields.companyContactPersonPhoneNumber.label`
            )}
          </$ViewFieldBold>
          <$ViewField>{data.companyContactPersonPhoneNumber}</$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.companyContactPersonEmail.review`)}
          </$ViewFieldBold>
          <$ViewField>{data.companyContactPersonEmail}</$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.applicantLanguage.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {t(`common:languages.${data.applicantLanguage || ''}`)}
          </$ViewField>
        </$GridCell>
      </SummarySection>
      {data.deMinimisAidSet && data.deMinimisAidSet?.length > 0 && (
        <SummarySection
          gap={theme.spacing.xs3}
          header={t(`${translationsBase}.headings.company6`)}
          action={
            <EditButton
              section={fields.deMinimisAidSet.name}
              dispatchStep={dispatchStep}
            />
          }
        >
          <$GridCell $colSpan={3}>
            <$SummaryTableHeader>
              <$ViewFieldBold>
                {t(`${translationsBase}.fields.deMinimisAidGranter.label`)}
              </$ViewFieldBold>
            </$SummaryTableHeader>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <$SummaryTableHeader>
              <$ViewFieldBold>
                {t(`${translationsBase}.fields.deMinimisAidAmount.review`)}
              </$ViewFieldBold>
            </$SummaryTableHeader>
          </$GridCell>
          <$GridCell>
            <$SummaryTableHeader>
              <$ViewFieldBold>
                {t(`${translationsBase}.fields.deMinimisAidGrantedAt.review`)}
              </$ViewFieldBold>
            </$SummaryTableHeader>
          </$GridCell>
          {data.deMinimisAidSet?.map(({ granter, grantedAt, amount }) => (
            <React.Fragment
              key={`${granter ?? ''}${convertToUIDateFormat(grantedAt)}`}
            >
              <$GridCell $colStart={1} $colSpan={3}>
                <$SummaryTableValue>{granter}</$SummaryTableValue>
              </$GridCell>
              <$GridCell $colSpan={2}>
                <$SummaryTableValue>
                  {formatFloatToCurrency(amount, 'EUR', 'FI-fi', 0)}
                </$SummaryTableValue>
              </$GridCell>
              <$GridCell>
                <$SummaryTableValue>
                  {grantedAt ? convertToUIDateFormat(grantedAt) : ''}
                </$SummaryTableValue>
              </$GridCell>
            </React.Fragment>
          ))}
          <$GridCell $colSpan={3} $colStart={1}>
            <$SummaryTableLastLine>
              {t(`${translationsBase}.fields.deMinimisAidAmount.reviewTotal`)}
            </$SummaryTableLastLine>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <$SummaryTableLastLine>
              {formatFloatToCurrency(
                data.totalDeminimisAmount,
                'EUR',
                'FI-fi',
                0
              )}
            </$SummaryTableLastLine>
          </$GridCell>
        </SummarySection>
      )}
      <SummarySection
        header={t(`${translationsBase}.headings.company4`)}
        action={
          <EditButton
            section={fields.coOperationNegotiations.name}
            dispatchStep={dispatchStep}
          />
        }
      >
        <$GridCell $colStart={1} $colSpan={12}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.coOperationNegotiations.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {t(
              `${translationsBase}.fields.coOperationNegotiations.${
                data.coOperationNegotiations ? 'yes' : 'no'
              }`
            )}
          </$ViewField>
          <$ViewField>{data.coOperationNegotiationsDescription}</$ViewField>
        </$GridCell>
      </SummarySection>
    </>
  );
};

export default CompanySection;
