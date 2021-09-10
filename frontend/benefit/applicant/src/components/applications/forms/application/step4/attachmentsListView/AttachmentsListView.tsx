import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import { Attachment } from 'benefit/applicant/types/application';
import { IconPaperclip } from 'hds-react';
import * as React from 'react';

import {
  $ViewField,
  $ViewFieldBold,
  $ViewFieldsContainer,
  $ViewFieldsGroup,
} from '../../Application.sc';

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
  const currentAttachemnts = React.useMemo((): Attachment[] => attachments, [
    attachments,
  ]);

  return (
    <$ViewFieldsContainer>
      <$ViewFieldsGroup>
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
      </$ViewFieldsGroup>
    </$ViewFieldsContainer>
  );
};

export default AttachmentsListView;
