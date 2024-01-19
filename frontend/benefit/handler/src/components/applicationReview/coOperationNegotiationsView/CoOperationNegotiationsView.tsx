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

const CoOperationNegotiationsView: React.FC<ApplicationReviewViewProps> = ({
  data,
}) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      id={data.id}
      header={t(`${translationsBase}.headings.heading4`)}
      action={!ACTIONLESS_STATUSES.includes(data.status) ? <span /> : null}
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
