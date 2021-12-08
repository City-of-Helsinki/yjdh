import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

const BenefitView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      withoutDivider
      header={t(`${translationsBase}.headings.heading7`)}
      action={data.status !== APPLICATION_STATUSES.RECEIVED ? <></> : null}
    >
      <$GridCell $colSpan={5}>
        <$ViewField>
          {`${t(`${translationsBase}.fields.benefitType`)}: `}
          <$ViewFieldBold>
            {t(`common:benefitTypes.${data.benefitType?.split('_')[0] || ''}`)}
          </$ViewFieldBold>
        </$ViewField>
      </$GridCell>
      <$GridCell />
      <$GridCell $colStart={1} $colSpan={2}>
        <$ViewField>{t(`${translationsBase}.fields.startDate`)}</$ViewField>
        <$ViewField>{data.startDate ? data.startDate : '-'}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <$ViewField>{t(`${translationsBase}.fields.endDate`)}</$ViewField>
        <$ViewField>{data.endDate ? data.endDate : '-'}</$ViewField>
      </$GridCell>
    </ReviewSection>
  );
};

export default BenefitView;
