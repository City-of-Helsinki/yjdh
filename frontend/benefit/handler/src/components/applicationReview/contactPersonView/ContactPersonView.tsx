import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';

const ContactPersonView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection header={t(`${translationsBase}.headings.heading2`)}>
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
          {t(`${translationsBase}.fields.applicantLanguage`)}
          {': '}
          <$ViewFieldBold>
            {t(`common:languages.${data.applicantLanguage || ''}`)}
          </$ViewFieldBold>
        </$ViewField>
      </$GridCell>
    </ReviewSection>
  );
};

export default ContactPersonView;
