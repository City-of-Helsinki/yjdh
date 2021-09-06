import { Application, DeMinimisAid } from 'benefit/applicant/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import { formatDate, parseDate } from 'shared/utils/date.utils';

import {
  $ViewField,
  $ViewFieldBold,
  $ViewFieldsContainer,
  $ViewFieldsGroup,
  $ViewListContainer,
  $ViewListHeading,
  $ViewListRow,
} from '../../Application.sc';

export interface CompanyInfoViewProps {
  data: Application;
}

const CompanyInfoView: React.FC<CompanyInfoViewProps> = ({ data }) => {
  const translationsBase = 'common:applications.sections';
  const { t } = useTranslation();
  return (
    <>
      <Heading as="h2" header={t(`${translationsBase}.company.heading1`)} />
      <$ViewFieldsContainer>
        <$ViewFieldsGroup>
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
        </$ViewFieldsGroup>
        <$ViewFieldsGroup>
          <$ViewField>
            {data.alternativeCompanyStreetAddress ||
              data.company?.streetAddress}
          </$ViewField>
          <$ViewField>{`${
            data.alternativeCompanyPostcode || data.company?.postcode || ''
          } ${
            data.alternativeCompanyCity || data.company?.city || ''
          }`}</$ViewField>
        </$ViewFieldsGroup>
      </$ViewFieldsContainer>
      <$ViewFieldsContainer>
        <$ViewField>
          {t(
            `${translationsBase}.company.fields.coOperationNegotiations.label`
          )}
          <$ViewFieldBold>
            {' '}
            {t(
              `${translationsBase}.company.fields.coOperationNegotiations.${
                data.coOperationNegotiations ? 'yes' : 'no'
              }`
            )}
          </$ViewFieldBold>
        </$ViewField>
      </$ViewFieldsContainer>
      <Heading
        as="h2"
        header={t(`${translationsBase}.company.heading2Short`)}
      />
      <$ViewFieldsContainer>
        <$ViewFieldsGroup>
          <$ViewField>{`${data.companyContactPersonFirstName || ''} ${
            data.companyContactPersonLastName || ''
          }`}</$ViewField>
          <$ViewField>{data.companyContactPersonPhoneNumber}</$ViewField>
          <$ViewField>{data.companyContactPersonEmail}</$ViewField>
          <$ViewField>
            {t(`${translationsBase}.company.fields.applicantLanguage.label`)}
            {': '}
            <$ViewFieldBold>
              {t(`common:languages.${data.applicantLanguage || ''}`)}
            </$ViewFieldBold>
          </$ViewField>
        </$ViewFieldsGroup>
      </$ViewFieldsContainer>
      <Heading as="h2" header={t(`${translationsBase}.company.heading3`)} />
      {data.deMinimisAidSet && data.deMinimisAidSet?.length > 0 && (
        <$ViewListContainer>
          <$ViewListRow>
            <$ViewListHeading>
              {t(
                `${translationsBase}.company.fields.deMinimisAidGranter.label`
              )}
            </$ViewListHeading>
            <$ViewListHeading>
              {t(`${translationsBase}.company.fields.deMinimisAidAmount.label`)}
            </$ViewListHeading>
            <$ViewListHeading>
              {t(
                `${translationsBase}.company.fields.deMinimisAidGrantedAt.labelShort`
              )}
            </$ViewListHeading>
          </$ViewListRow>
          {data.deMinimisAidSet?.map((aid: DeMinimisAid) => (
            <$ViewListRow key={aid.granter}>
              <$ViewField>{aid.granter}</$ViewField>
              <$ViewField>{aid.amount}</$ViewField>
              <$ViewField>
                {formatDate(parseDate(aid.grantedAt, 'yyyy-MM-dd'))}
              </$ViewField>
            </$ViewListRow>
          ))}
        </$ViewListContainer>
      )}
    </>
  );
};

export default CompanyInfoView;
