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
import { convertToUIDateFormat } from 'shared/utils/date.utils';

const BenefitView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      id={data.id}
      header={t(`${translationsBase}.headings.heading7`)}
      action={!ACTIONLESS_STATUSES.includes(data.status) ? <span /> : null}
      section="benefit"
    >
      <$GridCell $colStart={1} $colSpan={2}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.startDate`)}
        </$ViewFieldBold>
        <$ViewField>{convertToUIDateFormat(data.startDate) || '-'}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.endDate`)}
        </$ViewFieldBold>
        <$ViewField>{convertToUIDateFormat(data.endDate) || '-'}</$ViewField>
      </$GridCell>
    </ReviewSection>
  );
};

export default BenefitView;
