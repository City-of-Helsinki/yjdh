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

const CoOperationNegotiationsView: React.FC<ApplicationReviewViewProps> = ({
  data,
}) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading4`)}
      action={data.status !== APPLICATION_STATUSES.RECEIVED ? <span /> : null}
      section="coOperationNegotiations"
    >
      <$GridCell $colSpan={12}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.coOperationNegotiations`)}
        </$ViewFieldBold>
        <$ViewField>
          {` ${t(
            `common:utility.${data.coOperationNegotiations ? 'yes' : 'no'}`
          )}`}
        </$ViewField>
        {data.coOperationNegotiationsDescription && (
          <>
            <$ViewFieldBold>
              {t(
                `${translationsBase}.fields.coOperationNegotiationsDescription`
              )}
            </$ViewFieldBold>
            <$ViewField>{data.coOperationNegotiationsDescription}</$ViewField>
          </>
        )}
      </$GridCell>
    </ReviewSection>
  );
};

export default CoOperationNegotiationsView;
