import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/applicationForm/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ACTIONLESS_STATUSES } from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';

const ContactPersonView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      id={data.id}
      header={t(`${translationsBase}.headings.heading2`)}
      action={!ACTIONLESS_STATUSES.includes(data.status) ? <span /> : null}
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
        <$ViewFieldBold>{t(`${translationsBase}.fields.phone`)}</$ViewFieldBold>
        <$ViewField>{data.companyContactPersonPhoneNumber}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>{t(`${translationsBase}.fields.email`)}</$ViewFieldBold>
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
