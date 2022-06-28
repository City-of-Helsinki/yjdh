import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

const CoOperationNegotiationsView: React.FC<ApplicationReviewViewProps> = ({
  data,
}) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading4`)}
      action={data.status !== APPLICATION_STATUSES.RECEIVED ? <span /> : null}
    >
      <$GridCell $colSpan={12}>
        <$ViewField>
          {t(`${translationsBase}.fields.coOperationNegotiations`)}
          <$ViewFieldBold>{` ${t(
            `common:utility.${data.coOperationNegotiations ? 'yes' : 'no'}`
          )}`}</$ViewFieldBold>
        </$ViewField>
        {data.coOperationNegotiations && (
          <$ViewField>{data.coOperationNegotiationsDescription}</$ViewField>
        )}
      </$GridCell>
    </ReviewSection>
  );
};

export default CoOperationNegotiationsView;
