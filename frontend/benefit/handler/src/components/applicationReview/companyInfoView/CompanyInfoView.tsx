import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/applicationForm/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ACTIONLESS_STATUSES } from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { friendlyFormatIBAN } from 'ibantools';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

const CompanyInfoView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading1`)}
      action={!ACTIONLESS_STATUSES.includes(data.status) ? <span /> : null}
      section="company"
    >
      <$GridCell $colSpan={6}>
        <$ViewFieldBold large>{data.company?.name}</$ViewFieldBold>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.businessId`)}
        </$ViewFieldBold>
        <$ViewField>{data.company?.businessId}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.organizationType`)}
        </$ViewFieldBold>
        <$ViewField>
          {t(`common:organizationTypes.${data.company?.organizationType}`)}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.address`)}
        </$ViewFieldBold>
        <$ViewField>{`${data.company?.streetAddress}, ${
          data.company?.postcode || ''
        } ${data.company?.city || ''}`}</$ViewField>
      </$GridCell>
      {data.alternativeCompanyStreetAddress && (
        <$GridCell $colSpan={6}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.alternativeAddress`)}
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
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.bankAccountNumber`)}
        </$ViewFieldBold>
        <$ViewField>
          {friendlyFormatIBAN(data?.companyBankAccountNumber)}
        </$ViewField>
      </$GridCell>
      {data?.company?.organizationType === ORGANIZATION_TYPES.ASSOCIATION && (
        <$GridCell $colSpan={6}>
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
    </ReviewSection>
  );
};

export default CompanyInfoView;
