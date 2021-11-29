import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { Application } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

export interface CoOperationNegotiationsViewProps {
  data: Application;
}

const CoOperationNegotiationsView: React.FC<CoOperationNegotiationsViewProps> =
  ({ data }) => {
    const translationsBase = 'common:review';
    const { t } = useTranslation();
    // todo: add the association info in the bottom
    return (
      <>
        <ReviewSection header={t(`${translationsBase}.headings.heading4`)}>
          <$GridCell $colSpan={12}>
            <$ViewField>
              {t(`${translationsBase}.fields.coOperationNegotiations`)}
              <$ViewFieldBold>{` ${t(
                `common:utility.${data.coOperationNegotiations ? 'yes' : 'no'}`
              )}`}</$ViewFieldBold>
            </$ViewField>
          </$GridCell>
          {data.coOperationNegotiations && (
            <$GridCell $colSpan={12}>
              <$ViewField>{data.coOperationNegotiationsDescription}</$ViewField>
            </$GridCell>
          )}
        </ReviewSection>
      </>
    );
  };

export default CoOperationNegotiationsView;
