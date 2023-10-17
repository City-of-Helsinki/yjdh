import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/newApplication/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import AttachmentsListView from '../../attachmentsListView/AttachmentsListView';

const PaperView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading12`)}
      action={data.status !== APPLICATION_STATUSES.RECEIVED ? <span /> : null}
      section="paper"
    >
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.paperApplicationDate`)}
        </$ViewFieldBold>
        <$ViewField>
          {convertToUIDateFormat(data?.paperApplicationDate) || '-'}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <AttachmentsListView
          title={t(
            'common:applications.sections.attachments.types.fullApplication.title'
          )}
          type={ATTACHMENT_TYPES.FULL_APPLICATION}
          attachments={data.attachments || []}
        />
      </$GridCell>
    </ReviewSection>
  );
};

export default PaperView;
