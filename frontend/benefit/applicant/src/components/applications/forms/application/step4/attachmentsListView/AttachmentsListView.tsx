import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import { IconPaperclip } from 'hds-react';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Attachment from 'shared/types/attachment';

import { $ViewField, $ViewFieldBold } from '../../Application.sc';

export interface AttachmentsListViewProps {
  attachments: Attachment[];
  type: ATTACHMENT_TYPES;
  title: string;
}

const AttachmentsListView: React.FC<AttachmentsListViewProps> = ({
  attachments,
  type,
  title,
}) => {
  const currentAttachemnts = React.useMemo(
    (): Attachment[] => attachments,
    [attachments]
  );

  return (
    <$GridCell $colStart={1} $colSpan={6}>
      <$ViewFieldBold>{title}</$ViewFieldBold>
      {currentAttachemnts
        ?.filter((att: Attachment) => att.attachmentType === type)
        .map((attachment: Attachment) => (
          <$ViewField
            style={{ display: 'flex', alignItems: 'center' }}
            key={attachment.attachmentFileName}
          >
            <IconPaperclip aria-label={attachment.attachmentFileName} />
            {attachment.attachmentFileName}
          </$ViewField>
        ))}
    </$GridCell>
  );
};

export default AttachmentsListView;
