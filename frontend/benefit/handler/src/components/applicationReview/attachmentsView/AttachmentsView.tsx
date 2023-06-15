import AttachmentsListView from 'benefit/handler/components/attachmentsListView/AttachmentsListView';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

const EmploymentView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection header={t(`${translationsBase}.headings.heading11`)}>
      <AttachmentsListView
        title={t(
          'common:applications.sections.attachments.types.fullApplication.title'
        )}
        type={ATTACHMENT_TYPES.FULL_APPLICATION}
        attachments={data.attachments || []}
      />
      <AttachmentsListView
        title={t(
          'common:applications.sections.attachments.types.otherAttachment.title'
        )}
        type={ATTACHMENT_TYPES.OTHER_ATTACHMENT}
        attachments={data.attachments || []}
      />
    </ReviewSection>
  );
};

export default EmploymentView;
