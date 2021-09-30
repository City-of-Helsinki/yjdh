import { Application, DeMinimisAid } from 'benefit/applicant/types/application';
import { Button, IconPen } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { DATE_FORMATS, formatDate, parseDate } from 'shared/utils/date.utils';

import { $ViewField, $ViewFieldBold } from '../../Application.sc';

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
  return (
    <>
      <FormSection
        header={t(`${translationsBase}.company.heading1`)}
        action={
          <Button
            theme="black"
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

        <$GridCell $colStart={1} $colSpan={6}>
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
        </$GridCell>
      </FormSection>

      <FormSection
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
      </FormSection>

      <FormSection header={t(`${translationsBase}.company.heading3`)}>
        {data.deMinimisAidSet && data.deMinimisAidSet?.length > 0 && (
          <>
            <$GridCell $colSpan={3}>
              <$ViewFieldBold>
                {t(
                  `${translationsBase}.company.fields.deMinimisAidGranter.label`
                )}
              </$ViewFieldBold>
            </$GridCell>
            <$GridCell $colSpan={2}>
              <$ViewFieldBold>
                {t(
                  `${translationsBase}.company.fields.deMinimisAidAmount.label`
                )}
              </$ViewFieldBold>
            </$GridCell>
            <$GridCell>
              <$ViewFieldBold>
                {t(
                  `${translationsBase}.company.fields.deMinimisAidGrantedAt.labelShort`
                )}
              </$ViewFieldBold>
            </$GridCell>
            {data.deMinimisAidSet?.map((aid: DeMinimisAid) => (
              <React.Fragment
                key={`${aid.granter ?? ''}${aid.grantedAt ?? ''}`}
              >
                <$GridCell $colStart={1} $colSpan={3}>
                  <$ViewField>{aid.granter}</$ViewField>
                </$GridCell>
                <$GridCell $colSpan={2}>
                  <$ViewField>{aid.amount}</$ViewField>
                </$GridCell>
                <$GridCell>
                  <$ViewField>
                    {aid.grantedAt
                      ? formatDate(
                          parseDate(aid.grantedAt, DATE_FORMATS.DATE_BACKEND)
                        )
                      : ''}
                  </$ViewField>
                </$GridCell>
              </React.Fragment>
            ))}
          </>
        )}
      </FormSection>
    </>
  );
};

export default CompanyInfoView;
