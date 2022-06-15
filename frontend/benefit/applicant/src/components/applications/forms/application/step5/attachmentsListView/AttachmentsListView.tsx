import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { IconPaperclip } from 'hds-react';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import { BenefitAttachment } from 'shared/types/attachment';

import { $ViewField, $ViewFieldBold } from '../../Application.sc';

export interface AttachmentsListViewProps {
  attachments: BenefitAttachment[];
  type: ATTACHMENT_TYPES;
  title?: string;
}

const AttachmentsListView: React.FC<AttachmentsListViewProps> = ({
  attachments,
  type,
  title,
}) => {
  const attachmentItems = React.useMemo(
    (): BenefitAttachment[] =>
      attachments?.filter((att) => att.attachmentType === type),
    [attachments, type]
  );

  return attachmentItems.length > 0 ? (
    <$GridCell $colStart={1} $colSpan={6}>
      {title && <$ViewFieldBold>{title}</$ViewFieldBold>}
      {attachmentItems.map((attachment) => (
        <$ViewField
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: `${theme.spacing.xs} 0`,
            fontSize: theme.fontSize.body.m,
          }}
          key={attachment.attachmentFileName}
        >
          <IconPaperclip aria-label={attachment.attachmentFileName} />
          {attachment.attachmentFileName}
        </$ViewField>
      ))}
    </$GridCell>
  ) : null;
};

AttachmentsListView.defaultProps = {
  title: undefined,
};

export default AttachmentsListView;
