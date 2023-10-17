import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/newApplication/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';

const ContactPersonView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading2`)}
      action={data.status !== APPLICATION_STATUSES.RECEIVED ? <span /> : null}
      section="companyContactPerson"
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
            `${translationsBase}.fields.phone`
          )}
        </$ViewFieldBold>
        <$ViewField>{data.companyContactPersonPhoneNumber}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.email`)}
        </$ViewFieldBold>
        <$ViewField>{data.companyContactPersonEmail}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.applicantLanguage`)}
        </$ViewFieldBold>
        <$ViewField>
          {t(`common:languages.${data.applicantLanguage || ''}`)}
        </$ViewField>
      </$GridCell>
    </ReviewSection>
  );
};

export default ContactPersonView;
