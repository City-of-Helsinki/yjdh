import AttachmentsListView from 'benefit/handler/components/attachmentsListView/AttachmentsListView';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

const ConsentView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading9`)}
      action={
        data.status !== APPLICATION_STATUSES.RECEIVED ? <>some actions</> : null
      }
    >
      <$GridCell $colSpan={12}>
        <AttachmentsListView
          type={ATTACHMENT_TYPES.EMPLOYEE_CONSENT}
          attachments={data.attachments || []}
        />
      </$GridCell>
    </ReviewSection>
  );
};

export default ConsentView;
